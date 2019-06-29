export class ForceVector {
  private _x: number
  private _y: number
  constructor(x: number, y: number) {
    this._x = x
    this._y = y
  }

  public get x() {
    return this._x
  }

  public set x(value: number) {
    this._x = value
  }

  public get y() {
    return this._y
  }

  public set y(value: number) {
    this._y = value
  }
}
