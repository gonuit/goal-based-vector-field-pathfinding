import { Point } from '../objects/point';

interface TileMapConfig {
  verticalBoxes: number;
  horizontalBoxes: number;
  map: Array<Point>;
}

export class TileMap {
  private _verticalBoxes: number;
  private _horizontalBoxes: number;
  private _map: Array<Point>;
  constructor({ verticalBoxes, horizontalBoxes, map }: TileMapConfig) {
    this._horizontalBoxes = horizontalBoxes;
    this._verticalBoxes = verticalBoxes;
    // TODO: remove potential duplicates
    this._map = map.concat(this.initMapBorder());
  }

  private initMapBorder = (): Array<Point> => {
    const tileMap: Array<Point> = new Array(
      this.horizontalBoxes * 2 + this.verticalBoxes * 2 - 4,
    );
    let index = 0;
    for (let i = 0; i < this.horizontalBoxes; i++) {
      tileMap[index++] = new Point(i, 0);
      tileMap[index++] = new Point(i, this.verticalBoxes - 1);
    }
    for (let i = 1; i < this.verticalBoxes - 1; i++) {
      tileMap[index++] = new Point(0, i);
      tileMap[index++] = new Point(this.horizontalBoxes - 1, i);
    }
    return tileMap;
  };

  public get map(): Array<Point> {
    return this._map;
  }
  public get verticalBoxes(): number {
    return this._verticalBoxes;
  }
  public get horizontalBoxes(): number {
    return this._horizontalBoxes;
  }
}
