import { Box, BoxRenderConfig } from "./box";
import { Color } from "./color";
import { Utils } from "./utils";
import { Point } from "./point";
import { Scene } from "../engine/scene";

interface BoardDimensions {
  horizontalBoxes: number;
  verticalBoxes: number;
  boxSize?: number;
}

export interface BoardConfig extends BoardDimensions {
  initAll?: boolean;
  initialRendererConfig?: BoardRendererConfig;
  positionsToFill?: Array<Point>;
}

interface initBoxMapConfig {
  initAll?: boolean;
  positionsToFill?: Array<Point> | undefined;
}

export interface NamedChildrens {
  bottom?: Box;
  bottomLeft?: Box;
  bottomRight?: Box;
  top?: Box;
  topLeft?: Box;
  topRight?: Box;
  left?: Box;
  right?: Box;
}

export interface RenderColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface BoardRendererConfig extends BoxRenderConfig {
  color?: RenderColor;

  colorByDistance?: boolean;
  indicateBoardRefresh?: boolean;
}

export type BoxMap = Array<Array<Box | undefined>>;

export class Board {
  public static GOAL_DISTANCE = 0;
  private _indicateRefresh: boolean;
  private _rendererConfig: BoardRendererConfig;
  private _initialRendererConfig: BoardRendererConfig;
  private _scene: Scene;
  private _boxSize: number;
  private _boxMap: BoxMap;
  private _verticalBoxes: number;
  private _horizontalBoxes: number;
  private _goalPosition: Point;
  private _boxCount: number;
  constructor(
    scene: Scene,
    {
      horizontalBoxes,
      verticalBoxes,
      boxSize = 20,
      initAll = true,
      positionsToFill,
      initialRendererConfig = { color: { r: 255, g: 0, b: 0, a: 0.3 } }
    }: BoardConfig
  ) {
    this._scene = scene;
    this._rendererConfig = initialRendererConfig;
    this._initialRendererConfig = initialRendererConfig;
    this._verticalBoxes = verticalBoxes;
    this._horizontalBoxes = horizontalBoxes;
    this._goalPosition = new Point(-1, -1);
    this._boxSize = boxSize;
    this.initBoxMap({ initAll, positionsToFill });
  }

  private initBoxMap = ({
    initAll,
    positionsToFill
  }: initBoxMapConfig): void => {
    const map = [];
    if (initAll) {
      for (let col = 0; col < this._horizontalBoxes; col++) {
        map.push([]); // col array
        for (let row = 0; row < this._verticalBoxes; row++) {
          map[col].push(
            new Box({ position: new Point(col, row), size: this._boxSize })
          );
        }
      }
    } else if (positionsToFill instanceof Array) {
      for (let col = 0; col < this._horizontalBoxes; col++) {
        map.push([]); // col array
        for (let row = 0; row < this._verticalBoxes; row++) {
          map[col].push(undefined);
        }
      }
      Utils.uniquePointArray(positionsToFill).forEach(({ x, y }) => {
        map[x][y] = new Box({ position: new Point(x, y), size: this._boxSize });
      });
    }
    this._boxCount = map.flat().filter((box: Box) => box !== undefined).length;
    this._boxMap = map;
  };

  private forEachBox = (callback: (item: Box) => void): void => {
    for (let col = 0; col < this.boxMap.length; col++) {
      for (let row = 0; row < this.boxMap[col].length; row++) {
        const box = this.boxMap[col][row];
        if (box) callback(box);
      }
    }
  };

  private mapAllBox = (
    callback: (item: Box | undefined, x: number, y: number) => Box | undefined
  ): void => {
    for (let col = 0; col < this.boxMap.length; col++) {
      for (let row = 0; row < this.boxMap[col].length; row++) {
        this.boxMap[col][row] = callback(this.boxMap[col][row], row, col);
      }
    }
  };

  private getMaxDistance = (): number => {
    let max: number = -Infinity;
    this.forEachBox((item: Box) => {
      if (item.distance > max) max = item.distance;
    });
    return max;
  };

  public render(): Board {
    const {
      color: { r = 255, g = 0, b = 0, a = 0 } = {} as any,
      renderDistances = false,
      renderVectorLines = false,
      indicateBoardRefresh = false,
      colorByDistance = false
    } = this._rendererConfig;
    let maxDistance: number;
    if (colorByDistance) maxDistance = this.getMaxDistance();

    this._indicateRefresh = indicateBoardRefresh
      ? (this._indicateRefresh = !this._indicateRefresh)
      : false;

    this.forEachBox(box => {
      let color: number;
      const { distance } = box;
      if (this._indicateRefresh) {
        color = 0xaaff00;
      } else if (colorByDistance) {
        const blue: number = (255 * distance) / maxDistance;
        color = Color.rgbToHex(0, 0, blue);
      } else {
        color = Color.rgbToHex(r, g, b);
      }
      box.render(this._scene, {
        color,
        renderDistances,
        renderVectorLines
      });
    });
    return this;
  }

  public getBoxPositionByDimensions = (dimensions: Point): Point => {
    const { x, y } = dimensions;
    return new Point(
      x === 0 ? 0 : Math.trunc(x / this._boxSize),
      y === 0 ? 0 : Math.trunc(y / this._boxSize)
    );
  };

  public getBoxByDimensions = (dimensions: Point): Box => {
    const { x, y }: Point = this.getBoxPositionByDimensions(dimensions);
    return this.boxMap.length > x && this.boxMap[x].length > y
      ? this.boxMap[x][y]
      : undefined;
  };

  public getBoxByPosition = (position: Point): Box =>
    this.exist(position) ? this.boxMap[position.x][position.y] : undefined;

  public exist = ({ x, y }: Point): boolean =>
    x >= 0 &&
    y >= 0 &&
    this.boxMap.length > x &&
    this.boxMap[x].length > y &&
    this.boxMap[x][y] instanceof Box;

  public get boxMap(): BoxMap {
    return this._boxMap;
  }

  public get goalPosition(): Point {
    return this._goalPosition;
  }

  public get indicateRefresh(): boolean {
    return this._indicateRefresh;
  }

  public get boxSize(): number {
    return this._boxSize;
  }

  public get rendererConfig() {
    return this._rendererConfig;
  }

  public set rendererConfig(value: BoardRendererConfig) {
    this._rendererConfig = value;
    this.render();
  }

  private getBoxChildrens = ({ x, y }: Point): Array<Box> => {
    const leftChildren = this.getBoxByPosition(new Point(x - 1, y));
    const rightChildren = this.getBoxByPosition(new Point(x + 1, y));
    const topChildren = this.getBoxByPosition(new Point(x, y - 1));
    const bottomChildren = this.getBoxByPosition(new Point(x, y + 1));
    const leftTopChildren = this.getBoxByPosition(new Point(x - 1, y - 1));
    const rightTopChildren = this.getBoxByPosition(new Point(x + 1, y - 1));
    const rightBottomChildren = this.getBoxByPosition(new Point(x + 1, y + 1));
    const leftBottomChildren = this.getBoxByPosition(new Point(x - 1, y + 1));
    const childrenNodes = [
      leftChildren,
      rightChildren,
      topChildren,
      bottomChildren,
      leftTopChildren,
      leftBottomChildren,
      rightTopChildren,
      rightBottomChildren
    ];
    return childrenNodes.filter(childrenNodes => childrenNodes);
  };

  private setGoalDistance = (goalPosition: Point) => {
    this._goalPosition = goalPosition;
    const { x: goalX, y: goalY } = goalPosition;
    const goalBox: Box = this.boxMap
      .flat()
      .find(box => box && goalX === box.position.x && goalY === box.position.y);
    if (!goalBox) {
      // TODO: fix error
      return;
      throw new Error("Goal node does not exist");
    }

    goalBox.distance = Board.GOAL_DISTANCE;
    goalBox.visited = true;
  };

  private setDistances = (childrens: Array<Box>, distance: number) => {
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
    let childrenNodes: Array<Box> = this.getBoxChildrens(position).filter(
      ({ visited }) => !visited
    );
    while (childrenNodes.length > 0) {
      this.setDistances(childrenNodes, ++distance);
      let newChildrenNodes = [];
      childrenNodes.forEach(({ position }) => {
        newChildrenNodes = Utils.uniqueBoxArray(
          newChildrenNodes.concat(this.getBoxChildrens(position))
        );
      });

      childrenNodes = newChildrenNodes.filter(({ visited }) => !visited);
    }
  };
  public getNamedChildrens = ({ x, y }: Point): NamedChildrens => {
    const namedChildrens: NamedChildrens = {};
    namedChildrens.left = this.getBoxByPosition(new Point(x - 1, y));
    namedChildrens.right = this.getBoxByPosition(new Point(x + 1, y));
    namedChildrens.top = this.getBoxByPosition(new Point(x, y - 1));
    namedChildrens.bottom = this.getBoxByPosition(new Point(x, y + 1));
    namedChildrens.topLeft = this.getBoxByPosition(new Point(x - 1, y - 1));
    namedChildrens.topRight = this.getBoxByPosition(new Point(x + 1, y - 1));
    namedChildrens.bottomRight = this.getBoxByPosition(new Point(x + 1, y + 1));
    namedChildrens.bottomLeft = this.getBoxByPosition(new Point(x - 1, y + 1));
    return namedChildrens;
  };

  public calculateForceVectors = () => {
    this.forEachBox((parent: Box) => {
      const { position: parentPosition, distance: parentDistance } = parent;
      const fakeObject: any = { distance: parentDistance + 1 };
      const {
        bottom = fakeObject,
        bottomLeft = fakeObject,
        bottomRight = fakeObject,
        left = fakeObject,
        right = fakeObject,
        top = fakeObject,
        topLeft = fakeObject,
        topRight = fakeObject
      }: NamedChildrens = this.getNamedChildrens(parentPosition);
      parent.forceVector.x = (left.distance - right.distance) * 0.25;
      parent.forceVector.y = (top.distance - bottom.distance) * 0.25;
      parent.forceVector.y += -(bottomRight.distance - topLeft.distance) * 0.4;
      parent.forceVector.x += -(bottomRight.distance - topLeft.distance) * 0.4;
      parent.forceVector.y += -(bottomLeft.distance - topRight.distance) * 0.4;
      parent.forceVector.x += (bottomLeft.distance - topRight.distance) * 0.4;
    });
  };

  public calculateBoxesDistance = (goalPosition: Point): Board => {
    this.reset();
    this.setGoalDistance(goalPosition);
    this.calculateDistance(goalPosition);
    this.calculateForceVectors();
    return this;
  };

  public reset = (): Board => {
    this.forEachBox(box => {
      box.reset();
    });
    return this;
  };

  public removeFromBoard = (board: Board) => {
    const boxMap = board.boxMap;
    const newBoxPositions = this.boxMap
      .flat()
      .filter((box: Box | undefined) => {
        return (
          box &&
          !boxMap
            .flat()
            .some(
              boxToRemove =>
                boxToRemove && box.position.equals(boxToRemove.position)
            )
        );
      })
      .map(({ position }) => position);
    return new Board(this._scene, {
      initialRendererConfig: this._initialRendererConfig,
      verticalBoxes: this._verticalBoxes,
      horizontalBoxes: this._horizontalBoxes,
      boxSize: this._boxSize,
      initAll: false,
      positionsToFill: newBoxPositions
    });
  };

  public toArrayBuffer = (): ArrayBuffer => {
    const offset: number = 4;
    const array: Array<any> = new Array(this._boxCount * 4 + offset);
    array[0] = this._horizontalBoxes;
    array[1] = this._verticalBoxes;
    array[2] = this._boxSize;
    array[3] = this._boxCount;
    let i: number = 0;
    this.forEachBox(
      ({ position: { x, y }, forceVector: { x: forceX, y: forceY } }: Box) => {
        const firstItem: number = i * 4 + offset;
        array[firstItem] = x;
        array[firstItem + 1] = y;
        array[firstItem + 2] = forceX;
        array[firstItem + 3] = forceY;
        i++;
      }
    );
    return new Float64Array(array).buffer;
  };
}
