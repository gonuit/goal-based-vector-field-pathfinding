import { Box, Cords } from "./box";
import { Color } from "./color";
import { Utils } from "./utils";

interface BoardDimensions {
  height: number;
  width: number;
  boxSize?: number;
}

export interface BoardConfig extends BoardDimensions {
  initAll?: boolean;
  positionsToFill?: Array<Cords>;
}

interface initBoxMapConfig extends BoardDimensions {
  initAll?: boolean;
  positionsToFill?: Array<Cords> | undefined;
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
  randomColors?: boolean;
}

export type BoxMap = Array<Box>;

export class Board {
  private height: number;
  private width: number;
  private boxSize: number;
  private _boxMap: BoxMap;
  private vertBoxes: number;
  private horBoxes: number;
  constructor({
    height,
    width,
    boxSize = 20,
    initAll = true,
    positionsToFill
  }: BoardConfig) {
    this.height = height;
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
          map[col].push(new Box({ position: { x: col, y: row } }));
        }
      }
    } else if (positionsToFill instanceof Array) {
      positionsToFill.forEach(({ x, y }) => {
        map.push(new Box({ position: { x, y } }));
      });
    }
    console.log("boxmap", this._boxMap);
    this._boxMap = map.flat();
  };

  public render(
    factory: Phaser.GameObjects.GameObjectFactory,
    {
      color: { r = 255, g = 0, b = 0, a = 0.3 } = {} as any,
      withDistance = false,
      randomColors = false
    }: RenderConfig = {}
  ): Board {
    this._boxMap.map(box => {
      const colors: [number, number, number] = randomColors
        ? [
            Utils.getRandomInt(10, 255),
            Utils.getRandomInt(10, 255),
            Utils.getRandomInt(10, 255)
          ]
        : [r, g, b];
      const { x, y } = box.position;
      const boxXposition = -this.boxSize + x * this.boxSize;
      const boxYposition = -this.boxSize + y * this.boxSize;
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
      if (withDistance) {
        const centerAlign = this.boxSize * 1.33;
        factory.bitmapText(
          boxXposition + centerAlign,
          boxYposition + centerAlign,
          "snakeFont",
          box.distance.toString(),
          8
        );
      }
      return box;
    });
    return this;
  }

  public get boxMap(): BoxMap {
    return this._boxMap;
  }

  public removeFromBoard = (board: Board) => {
    const boxMap = board.boxMap;
    const newBoxPositions = this.boxMap
      .filter(({ position: { x, y } }) => {
        return !boxMap.some(
          ({ position: { x: xToRemove, y: yToRemove } }) =>
            x === xToRemove && y === yToRemove
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
