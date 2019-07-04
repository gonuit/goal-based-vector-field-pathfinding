import { ForceVector } from "../objects/forceVector";

export interface ShallowBox {
  positionX: number;
  positionY: number;
  centerPositionY: number;
  centerPositionX: number;
  forceVector: ForceVector;
}

export interface ShallowNamedChildrens {
  bottom?: ShallowBox;
  bottomLeft?: ShallowBox;
  bottomRight?: ShallowBox;
  top?: ShallowBox;
  topLeft?: ShallowBox;
  topRight?: ShallowBox;
  left?: ShallowBox;
  right?: ShallowBox;
}

export class WorkerShallowBoard {
  private _boxSize: number;
  private _boxCount: number;
  private _verticalBoxes: number;
  private _horizontalBoxes: number;
  private shallowBoxMap: Array<Array<ShallowBox>>;
  constructor(boardArrayBuffer: ArrayBuffer) {
    const [
      horizontalBoxes,
      verticalBoxes,
      boxSize,
      boxCount,
      ...boxMap
    ] = new Float64Array(boardArrayBuffer);
    this._horizontalBoxes = horizontalBoxes;
    this._boxCount = boxCount;
    this._verticalBoxes = verticalBoxes;
    this._boxSize = boxSize;

    this.initShallowBoxMap(boxMap);
  }

  private initShallowBoxMap = (boxMap: Array<number>) => {
    this.shallowBoxMap = new Array(this._horizontalBoxes);
    for (let col = 0; col < this._horizontalBoxes; col++) {
      this.shallowBoxMap[col] = new Array(this._verticalBoxes);
    }
    this.setShallowBoxMap(boxMap);
    console.log(`initialized thread`);
  };

  public setShallowBoxMap = (boxMap: Array<number> | Float64Array): void => {
    for (let i = 0; i < this._boxCount; i++) {
      const firstItem = i * 4;
      const positionX = boxMap[firstItem];
      const positionY = boxMap[firstItem + 1];
      const forceX = boxMap[firstItem + 2];
      const forceY = boxMap[firstItem + 3];
      this.shallowBoxMap[positionX][positionY] = {
        positionX,
        positionY,
        centerPositionX: positionX * this.boxSize + this.boxSize * 0.5,
        centerPositionY: positionY * this.boxSize + this.boxSize * 0.5,
        forceVector: new ForceVector(forceX, forceY)
      };
    }
  };

  public getBoxPositionByDimensions = (
    x: number,
    y: number
  ): { x: number; y: number } => {
    return {
      x: x === 0 ? 0 : Math.trunc(x / this._boxSize),
      y: y === 0 ? 0 : Math.trunc(y / this._boxSize)
    };
  };

  public getBoxByDimensions = (dimX: number, dimY: number): ShallowBox => {
    const { x, y } = this.getBoxPositionByDimensions(dimX, dimY);
    return this.shallowBoxMap.length > x &&
      this.shallowBoxMap[x] instanceof Array &&
      this.shallowBoxMap[x].length > y
      ? this.shallowBoxMap[x][y]
      : undefined;
  };

  public exist = (x: number, y: number): boolean =>
    Boolean(
      x >= 0 &&
        y >= 0 &&
        this.shallowBoxMap.length > x &&
        this.shallowBoxMap[x].length > y &&
        this.shallowBoxMap[x][y]
    );

  public get boxSize(): number {
    return this._boxSize;
  }

  public getBoxByPosition = (x: number, y: number) =>
    this.exist(x, y) ? this.shallowBoxMap[x][y] : undefined;

  public getShallowNamedChildrens = (
    x: number,
    y: number
  ): ShallowNamedChildrens => {
    const shallowNamedChildrens: ShallowNamedChildrens = {};
    shallowNamedChildrens.left = this.getBoxByPosition(x - 1, y);
    shallowNamedChildrens.right = this.getBoxByPosition(x + 1, y);
    shallowNamedChildrens.top = this.getBoxByPosition(x, y - 1);
    shallowNamedChildrens.bottom = this.getBoxByPosition(x, y + 1);
    shallowNamedChildrens.topLeft = this.getBoxByPosition(x - 1, y - 1);
    shallowNamedChildrens.topRight = this.getBoxByPosition(x + 1, y - 1);
    shallowNamedChildrens.bottomRight = this.getBoxByPosition(x + 1, y + 1);
    shallowNamedChildrens.bottomLeft = this.getBoxByPosition(x - 1, y + 1);
    return shallowNamedChildrens;
  };
}
