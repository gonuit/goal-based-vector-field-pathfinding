import { Box, BoxRenderConfig } from "./box"
import { Color } from "./color"
import { Utils } from "./utils"
import { Point } from "./point"

interface BoardDimensions {
  height: number
  width: number
  boxSize?: number
}

export interface BoardConfig extends BoardDimensions {
  initAll?: boolean
  positionsToFill?: Array<Point>
}

interface initBoxMapConfig extends BoardDimensions {
  initAll?: boolean
  positionsToFill?: Array<Point> | undefined
}

export interface NamedChildrens {
  bottom?: Box
  bottomLeft?: Box
  bottomRight?: Box
  top?: Box
  topLeft?: Box
  topRight?: Box
  left?: Box
  right?: Box
}

export interface RenderColor {
  r: number
  g: number
  b: number
  a: number
}

export interface RenderConfig extends BoxRenderConfig {
  color?: RenderColor

  colorByDistance?: boolean
  randomColors?: boolean
}

export type BoxMap = Array<Box>

export class Board {
  public static GOAL_DISTANCE = 0
  private height: number
  private width: number
  private boxSize: number
  private _boxMap: BoxMap
  private vertBoxes: number
  private horBoxes: number
  private _goalPosition: Point
  constructor({ height, width, boxSize = 20, initAll = true, positionsToFill }: BoardConfig) {
    this.height = height
    this._goalPosition = new Point(-1, -1)
    this.width = width
    this.boxSize = boxSize
    this.initBoxMap({ height, width, boxSize, initAll, positionsToFill })
  }

  private initBoxMap = ({ height, width, boxSize, initAll, positionsToFill }: initBoxMapConfig): void => {
    this.vertBoxes = parseInt((height / boxSize) as any)
    this.horBoxes = parseInt((width / boxSize) as any)

    const map = []
    if (initAll) {
      for (let col = 0; col < this.horBoxes; col++) {
        map.push([]) // col array
        for (let row = 0; row < this.vertBoxes; row++) {
          map[col].push(new Box({ position: new Point(col, row), size: this.boxSize }))
        }
      }
    } else if (positionsToFill instanceof Array) {
      positionsToFill.forEach(({ x, y }) => {
        map.push(new Box({ position: new Point(x, y), size: this.boxSize }))
      })
    }
    this._boxMap = map.flat()
  }

  public render(
    factory: Phaser.GameObjects.GameObjectFactory,
    {
      color: { r = 255, g = 0, b = 0, a = 0.3 } = {} as any,
      renderDistances = false,
      renderVectorLines = false,
      randomColors = false,
      colorByDistance = false,
    }: RenderConfig = {}
  ): Board {
    let maxDistance: number
    if (colorByDistance) {
      maxDistance = Math.max(...this.boxMap.map(({ distance }) => distance))
    }
    this._boxMap.map((box) => {
      let colors: [number, number, number]
      const { distance } = box
      if (colorByDistance) {
        const blue: number = (255 * distance) / maxDistance
        colors = [0, 0, blue]
      } else {
        colors = randomColors
          ? [Utils.getRandomInt(10, 255), Utils.getRandomInt(10, 255), Utils.getRandomInt(10, 255)]
          : [r, g, b]
      }
      box.render(factory, {
        color: Color.rgbToHex(...colors),
        renderDistances,
        renderVectorLines,
      })
      return box
    })
    return this
  }

  public getBoxPositionByDimensions = (dimensions: Point): Point => {
    const { x, y } = dimensions
    return new Point(
      x === 0 ? 0 : parseInt((x / this.boxSize) as any),
      y === 0 ? 0 : parseInt((y / this.boxSize) as any)
    )
  }

  public getBoxByDimensions = (dimensions: Point): Box => {
    const boxPosition: Point = this.getBoxPositionByDimensions(dimensions)
    return this._boxMap.find(({ position }) => position.equals(boxPosition))
  }

  public exist = (position: Point): boolean =>
    this._boxMap.some(({ position: { x: boxX, y: boxY } }) => boxX === position.x && boxY === position.y)

  public get boxMap(): BoxMap {
    return this._boxMap
  }

  public get goalPosition(): Point {
    return this._goalPosition
  }

  private getBoxChildrens = ({ x, y }: Point): BoxMap => {
    const childrenNodes = this.boxMap.filter(({ position: { x: boxX, y: boxY } }) => {
      return (
        ((x === boxX + 1 || x === boxX - 1) && (y === boxY + 1 || y === boxY - 1)) ||
        ((x === boxX && (y === boxY + 1 || y === boxY - 1)) || (y === boxY && (x === boxX + 1 || x === boxX - 1)))
      )
    })
    return childrenNodes
  }

  private setGoalDistance = (goalPosition: Point) => {
    this._goalPosition = goalPosition
    const { x: goalX, y: goalY } = goalPosition
    const goalBox: Box = this.boxMap.find(({ position: { x, y } }) => goalX === x && goalY === y)
    if (!goalBox) throw new Error("Goal node does not exist")
    goalBox.distance = Board.GOAL_DISTANCE
    goalBox.visited = true
  }

  private setDistances = (childrens: BoxMap, distance: number) => {
    childrens.forEach((children: Box) => {
      if (children.visited) return
      children.distance = distance
      children.visited = true
    })
  }

  private calculateDistance = async (position: Point, distance: number = Board.GOAL_DISTANCE) => {
    let childrenNodes: BoxMap = this.getBoxChildrens(position).filter(({ visited }) => !visited)
    while (childrenNodes.length > 0) {
      this.setDistances(childrenNodes, ++distance)
      let newChildrenNodes = []
      childrenNodes.forEach(({ position }) => {
        newChildrenNodes = Utils.unique(newChildrenNodes.concat(this.getBoxChildrens(position)))
      })

      childrenNodes = newChildrenNodes.filter(({ visited }) => !visited)
    }
  }

  private getNamedChildrens = (parent: Box): NamedChildrens => {
    const { position: parentPosition } = parent
    const childrenNodes: BoxMap = this.getBoxChildrens(parentPosition)
    const namedChildrens: NamedChildrens = {}
    childrenNodes.forEach((childrenBox: Box) => {
      const { position: childrenPosition } = childrenBox
      // 1 if over | -1 if under | 0 if the same line
      const verticalPosition = parentPosition.verticalPosition(childrenPosition)
      const horizontalPosition = parentPosition.horizontalPosition(childrenPosition)

      if (horizontalPosition < 0) {
        // left bottom
        if (verticalPosition < 0) {
          namedChildrens.bottomLeft = childrenBox
          // left top
        } else if (verticalPosition > 0) {
          namedChildrens.topLeft = childrenBox
          // left
        } else {
          namedChildrens.left = childrenBox
        }
      } else if (horizontalPosition > 0) {
        // right bottom
        if (verticalPosition < 0) {
          namedChildrens.bottomRight = childrenBox
          // right top
        } else if (verticalPosition > 0) {
          namedChildrens.topRight = childrenBox
          // right
        } else {
          namedChildrens.right = childrenBox
        }
      } else {
        // bottom
        if (verticalPosition < 0) {
          namedChildrens.bottom = childrenBox
          // top
        } else if (verticalPosition > 0) {
          namedChildrens.top = childrenBox
        }
      }
    })
    return namedChildrens
  }

  public calculateForceVectors = () => {
    const TEST_VALUE: number = 1
    this._boxMap.forEach((parent: Box) => {
      const { position, distance: parentDistance } = parent
      const fakeObject: any =  { distance: parent.distance + 1 }
      const {
        bottom = fakeObject,
        bottomLeft = fakeObject,
        bottomRight = fakeObject,
        left = fakeObject,
        right = fakeObject,
        top = fakeObject,
        topLeft = fakeObject,
        topRight = fakeObject,
      }: NamedChildrens = this.getNamedChildrens(parent)
      parent.forceVector.x = left.distance - right.distance
      parent.forceVector.y = top.distance - bottom.distance
      // const forceLeftCross: number = topRight.distance - bottomLeft.distance
      // const forceRightCross: number = topLeft.distance - bottomRight.distance
      // parent.forceVector.x += (forceLeftCross * 0.25)
      // parent.forceVector.y += forceLeftCross * 0.25
      // parent.forceVector.x += (forceRightCross * 0.25)
      // parent.forceVector.y += (forceRightCross * 0.25)
    })
  }

  public calculateBoxesDistance = (goalPosition: Point): Board => {
    this.reset()
    this.setGoalDistance(goalPosition)
    this.calculateDistance(goalPosition)
    this.calculateForceVectors()
    return this
  }

  public reset = (): Board => {
    this.boxMap.forEach((box) => {
      box.reset()
    })
    return this
  }

  public removeFromBoard = (board: Board) => {
    const boxMap = board.boxMap
    const newBoxPositions = this.boxMap
      .filter(({ position }) => {
        return !boxMap.some(({ position: positionToRemove }) => position.equals(positionToRemove))
      })
      .map(({ position }) => position)
    return new Board({
      height: this.height,
      width: this.width,
      boxSize: this.boxSize,
      initAll: false,
      positionsToFill: newBoxPositions,
    })
  }
}
