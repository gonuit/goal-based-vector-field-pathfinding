import { Box } from "./box";
import { Color } from "./color";
import { Utils } from "./utils";
import { Point } from "./point";

interface BoardDimensions {
  height: number;
  width: number;
  boxSize?: number;
}

export interface BoardConfig extends BoardDimensions {
  initAll?: boolean;
  positionsToFill?: Array<Point>;
}

interface initBoxMapConfig extends BoardDimensions {
  initAll?: boolean;
  positionsToFill?: Array<Point> | undefined;
}

export interface RenderColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface RenderConfig {
  color?: RenderColor;
  withDistance?: boolean;
  colorByDistance?: boolean;
  randomColors?: boolean;
}

export type BoxMap = Array<Box>;

export class Board {
  public static GOAL_DISTANCE = 0;
  private height: number;
  private width: number;
  private boxSize: number;
  private _boxMap: BoxMap;
  private vertBoxes: number;
  private horBoxes: number;
  private _goalPosition: Point;
  constructor({
    height,
    width,
    boxSize = 20,
    initAll = true,
    positionsToFill
  }: BoardConfig) {
    this.height = height;
    this._goalPosition = new Point(-1, -1);
    this.width = width;
    this.boxSize = boxSize;
    this.initBoxMap({ height, width, boxSize, initAll, positionsToFill });
  }

  private initBoxMap = ({
    height,
    width,
    boxSize,
    initAll,
    positionsToFill
  }: initBoxMapConfig): void => {
    this.vertBoxes = parseInt((height / boxSize) as any);
    this.horBoxes = parseInt((width / boxSize) as any);

    const map = [];
    if (initAll) {
      for (let col = 0; col < this.horBoxes; col++) {
        map.push([]); // col array
        for (let row = 0; row < this.vertBoxes; row++) {
          map[col].push(new Box({ position: new Point(col, row) }));
        }
      }
    } else if (positionsToFill instanceof Array) {
      positionsToFill.forEach(({ x, y }) => {
        map.push(new Box({ position: new Point(x, y) }));
      });
    }
    this._boxMap = map.flat();
  };

  public render(
    factory: Phaser.GameObjects.GameObjectFactory,
    {
      color: { r = 255, g = 0, b = 0, a = 0.3 } = {} as any,
      withDistance = false,
      randomColors = false,
      colorByDistance = false
    }: RenderConfig = {}
  ): Board {
    let maxDistance: number;
    if (colorByDistance) {
      maxDistance = Math.max(...this.boxMap.map(({ distance }) => distance));
    }
    this._boxMap.map(box => {
      let colors: [number, number, number];
      const {
        position: { x, y },
        distance
      } = box;
      const boxXposition = -this.boxSize + x * this.boxSize;
      const boxYposition = -this.boxSize + y * this.boxSize;
      if (colorByDistance) {
        const blue: number = (255 * distance) / maxDistance;
        colors = [0, 0, blue];
      } else {
        colors = randomColors
          ? [
              Utils.getRandomInt(10, 255),
              Utils.getRandomInt(10, 255),
              Utils.getRandomInt(10, 255)
            ]
          : [r, g, b];
      }
      if (box.graphicsObject) {
        box.graphicsObject.fillStyle(Color.rgbToHex(...colors));
      } else {
        box.graphicsObject = factory
          .graphics({
            x: boxXposition,
            y: boxYposition,
            fillStyle: {
              color: Color.rgbToHex(...colors),
              alpha: a
            }
          })
          .fillRect(this.boxSize, this.boxSize, this.boxSize, this.boxSize);
      }
      if (withDistance && !box.bitmapText) {
        const centerAlign = this.boxSize * 1.33;
        box.bitmapText = factory.bitmapText(
          boxXposition + centerAlign,
          boxYposition + centerAlign,
          "mainFont",
          box.distance.toString(),
          8
        );
      } else if (box.bitmapText && box.bitmapText) {
        box.removeBitmap();
      }
      return box;
    });
    return this;
  }

  public getBoxPositionByDimensions = (dimensions: Point): Point => {
    const { x, y } = dimensions;
    return new Point(
      x === 0 ? 0 : parseInt((x / this.boxSize) as any),
      y === 0 ? 0 : parseInt((y / this.boxSize) as any)
    );
  };

  public exist = (position: Point): boolean =>
    this._boxMap.some(
      ({ position: { x: boxX, y: boxY } }) =>
        boxX === position.x && boxY === position.y
    );

  public get boxMap(): BoxMap {
    return this._boxMap;
  }

  public get goalPosition(): Point {
    return this._goalPosition;
  }

  private getBoxChildrens = ({ x, y }: Point): BoxMap => {
    const childrenNodes = this.boxMap.filter(
      ({ position: { x: boxX, y: boxY } }) => {
        return (
          ((x === boxX + 1 || x === boxX - 1) &&
            (y === boxY + 1 || y === boxY - 1)) ||
          ((x === boxX && (y === boxY + 1 || y === boxY - 1)) ||
            (y === boxY && (x === boxX + 1 || x === boxX - 1)))
        );
      }
    );
    return childrenNodes;
  };

  private setGoalDistance = (goalPosition: Point) => {
    this._goalPosition = goalPosition;
    const { x: goalX, y: goalY } = goalPosition;
    const goalBox: Box = this.boxMap.find(
      ({ position: { x, y } }) => goalX === x && goalY === y
    );
    if (!goalBox) throw new Error("Goal node does not exist");
    goalBox.distance = Board.GOAL_DISTANCE;
    goalBox.visited = true;
  };

  private setDistances = (childrens: BoxMap, distance: number) => {
    childrens.forEach((children: Box) => {
      if (children.visited) return;
      children.distance = distance;
      children.visited = true;
    });
  };

  private calculateDistance = async (
    position: Point,
    distance: number = Board.GOAL_DISTANCE
  ) => {
    let childrenNodes: BoxMap = this.getBoxChildrens(position).filter(
      ({ visited }) => !visited
    );
    while (childrenNodes.length > 0) {
      this.setDistances(childrenNodes, ++distance);
      let newChildrenNodes = [];
      childrenNodes.forEach(({ position }) => {
        newChildrenNodes = Utils.unique(
          newChildrenNodes.concat(this.getBoxChildrens(position))
        );
      });

      childrenNodes = newChildrenNodes.filter(({ visited }) => !visited);
    }
  };

  public calculateBoxesDistance = (goalPosition: Point): Board => {
    this.reset()
    this.setGoalDistance(goalPosition);
    this.calculateDistance(goalPosition);
    return this;
  };

  public reset(): Board {
    this.boxMap.forEach(box => {
      box.reset();
    });
    return this;
  }

  public removeFromBoard = (board: Board) => {
    const boxMap = board.boxMap;
    const newBoxPositions = this.boxMap
      .filter(({ position }) => {
        return !boxMap.some(({ position: positionToRemove }) =>
          position.equals(positionToRemove)
        );
      })
      .map(({ position }) => position);
    return new Board({
      height: this.height,
      width: this.width,
      boxSize: this.boxSize,
      initAll: false,
      positionsToFill: newBoxPositions
    });
  };
}
