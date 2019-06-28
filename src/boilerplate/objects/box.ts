import { Point } from "./point";

export interface BoxConfig {
  distance?: number;
  visited?: boolean;
  position: Point;
}

export class Box {
  private _distance: number;
  private _visited: boolean;
  public position: Point;
  public graphicsObject: Phaser.GameObjects.Graphics;
  public bitmapText: Phaser.GameObjects.BitmapText;
  constructor({ distance = 0, position, visited = false }: BoxConfig) {
    this._distance = distance;
    this._visited = visited;
    this.position = position;
  }

  public set distance(value: number) {
    this._distance = value;
  }
  public get distance() {
    return this._distance;
  }

  public set visited(value: boolean) {
    this._visited = value;
  }

  public get visited() {
    return this._visited;
  }

  public reset() {
    this._visited = false;
    this._distance = 0;
    if (this.graphicsObject) {
      this.graphicsObject.destroy();
      this.graphicsObject = undefined;
    }
    if(this.bitmapText) {
      this.bitmapText.destroy()
      this.bitmapText = undefined;
    }
  }
}
