import { ForceVector } from "../objects/forceVector";

export interface ShallowBox {
  positionX: number;
  positionY: number;
  forceVector: ForceVector
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
    console.log('initialized', this)
  };

  public setShallowBoxMap = (boxMap: Array<number> | Float64Array): void => {
    for (let i = 0; i < boxMap.length / 4; i++) {
      const firstItem = i * 4;
      const positionX = boxMap[firstItem];
      const positionY = boxMap[firstItem + 1];
      const forceX = boxMap[firstItem + 2];
      const forceY = boxMap[firstItem + 3];
      this.shallowBoxMap[positionX][positionY] = {
        positionX,
        positionY,
        forceVector: new ForceVector(forceX, forceY)
      };
    }
  };

  public getBoxPositionByDimensions = (x, y): { x: number, y: number } => {
    return ({
      x: x === 0 ? 0 : Math.trunc(x / this._boxSize),
      y: y === 0 ? 0 : Math.trunc(y / this._boxSize)
    });
  };

  public getBoxByDimensions = (dimX, dimY): ShallowBox => {
    const { x, y } = this.getBoxPositionByDimensions(dimX,dimY);
    return this.shallowBoxMap.length > x && this.shallowBoxMap[x].length > y
      ? this.shallowBoxMap[x][y]
      : undefined;
  };
}
