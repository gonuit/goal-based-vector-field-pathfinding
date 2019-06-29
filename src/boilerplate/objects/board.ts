import { Box, BoxRenderConfig } from "./box"
import { Color } from "./color"
import { Utils } from "./utils"
import { Point } from "./point"
import { Scene } from "phaser"

interface BoardDimensions {
  horizontalBoxes: number
  verticalBoxes: number
  boxSize?: number
}

export interface BoardConfig extends BoardDimensions {
  initAll?: boolean
  initialRendererConfig?: BoardRendererConfig
  positionsToFill?: Array<Point>
}

interface initBoxMapConfig {
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

export interface BoardRendererConfig extends BoxRenderConfig {
  color?: RenderColor

  colorByDistance?: boolean
  indicateBoardRefresh?: boolean
}

export type BoxMap = Array<Box>

export class Board {
  public static GOAL_DISTANCE = 0
  private _indicateRefresh: boolean
  private _rendererConfig: BoardRendererConfig
  private _initialRendererConfig: BoardRendererConfig
  private _scene: Scene
  private _boxSize: number
  private _boxMap: BoxMap
  private _verticalBoxes: number
  private horizontalBoxes: number
  private _goalPosition: Point
  constructor(
    scene: Scene,
    {
      horizontalBoxes,
      verticalBoxes,
      boxSize = 20,
      initAll = true,
      positionsToFill,
      initialRendererConfig = { color: { r: 255, g: 0, b: 0, a: 0.3 } },
    }: BoardConfig
  ) {
    this._scene = scene
    this._rendererConfig = initialRendererConfig
    this._initialRendererConfig = initialRendererConfig
    this._verticalBoxes = verticalBoxes
    this.horizontalBoxes = horizontalBoxes
    this._goalPosition = new Point(-1, -1)
    this._boxSize = boxSize
    this.initBoxMap({ initAll, positionsToFill })
  }

  private initBoxMap = ({ initAll, positionsToFill }: initBoxMapConfig): void => {
    const map = []
    if (initAll) {
      for (let col = 0; col < this.horizontalBoxes; col++) {
        map.push([]) // col array
        for (let row = 0; row < this._verticalBoxes; row++) {
          map[col].push(new Box({ position: new Point(col, row), size: this._boxSize }))
        }
      }
    } else if (positionsToFill instanceof Array) {
      positionsToFill.forEach(({ x, y }) => {
        map.push(new Box({ position: new Point(x, y), size: this._boxSize }))
      })
    }
    this._boxMap = map.flat()
  }

  public render(): Board {
    const {
      color: { r = 255, g = 0, b = 0, a = 0 } = {} as any,
      renderDistances = false,
      renderVectorLines = false,
      indicateBoardRefresh = false,
      colorByDistance = false,
    } = this._rendererConfig
    let maxDistance: number
    if (colorByDistance) maxDistance = Math.max(...this.boxMap.map(({ distance }) => distance))

    this._indicateRefresh = indicateBoardRefresh ? (this._indicateRefresh = !this._indicateRefresh) : false

    this._boxMap.forEach((box) => {
      let color: number
      const { distance } = box
      if (this._indicateRefresh) {
        color = 0xaaff00
      } else if (colorByDistance) {
        const blue: number = (255 * distance) / maxDistance
        color = Color.rgbToHex(0, 0, blue)
      } else {
        color = Color.rgbToHex(r, g, b)
      }
      box.render(this._scene.add, {
        color,
        renderDistances,
        renderVectorLines,
      })
    })
    return this
  }

  public getBoxPositionByDimensions = (dimensions: Point): Point => {
    const { x, y } = dimensions
    return new Point(
      x === 0 ? 0 : parseInt((x / this._boxSize) as any),
      y === 0 ? 0 : parseInt((y / this._boxSize) as any)
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

  public get indicateRefresh(): boolean {
    return this._indicateRefresh
  }

  public get rendererConfig() {
    return this._rendererConfig
  }

  public set rendererConfig(value: BoardRendererConfig) {
    this._rendererConfig = value
    this.render()
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
    this._boxMap.forEach((parent: Box) => {
      const { position, distance: parentDistance } = parent
      const fakeObject: any = { distance: parentDistance + 1 }
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
      parent.forceVector.x = (left.distance - right.distance) * 0.25
      parent.forceVector.y = (top.distance - bottom.distance) * 0.25
      parent.forceVector.y += -(bottomRight.distance - topLeft.distance) * 0.5
      parent.forceVector.x += -(bottomRight.distance - topLeft.distance) * 0.5
      parent.forceVector.y += -(bottomLeft.distance - topRight.distance) * 0.5
      parent.forceVector.x += (bottomLeft.distance - topRight.distance) * 0.5
      
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
    return new Board(this._scene, {
      initialRendererConfig: this._initialRendererConfig,
      verticalBoxes: this._verticalBoxes,
      horizontalBoxes: this.horizontalBoxes,
      boxSize: this._boxSize,
      initAll: false,
      positionsToFill: newBoxPositions,
    })
  }
}
