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

  public sub = (forceVector: ForceVector): ForceVector =>
    new ForceVector(this.x - forceVector.x, this.y - forceVector.y)

  public add = (forceVector: ForceVector): ForceVector =>
    new ForceVector(this.x + forceVector.x, this.y + forceVector.y)

  public multiplyBy = (number: number): ForceVector => new ForceVector(this.x * number, this.y * number)

  public normalize = (): ForceVector => {
    const { x, y } = this
    const length = Math.sqrt(x * x + y * y)
    return new ForceVector(x === 0 ? 0 : x / length, y === 0 ? 0 : y / length)
  }

  public truncate = (maxForce: number) => this.normalize().multiplyBy(maxForce)

  public devide = (number: number): ForceVector => new ForceVector(this.x / number, this.y / number)
}
