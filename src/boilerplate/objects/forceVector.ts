export class ForceVector {
  private _x: number;
  private _y: number;
  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  public get x() {
    return this._x;
  }

  public set x(value: number) {
    this._x = value;
  }

  public get y() {
    return this._y;
  }

  public set y(value: number) {
    this._y = value;
  }

  public sub = (forceVector: ForceVector): ForceVector => {
    this.x -= forceVector.x;
    this.y -= forceVector.y;
    return this;
  };

  public add = (forceVector: ForceVector): ForceVector => {
    this.x += forceVector.x;
    this.y += forceVector.y;
    return this;
  };

  public copy = (): ForceVector =>
    new ForceVector(this.x, this.y);

  public multiplyBy = (number: number): ForceVector => {
    this.x *= number;
    this.y *= number;
    return this;
  };

  public normalize = (): ForceVector => {
    const { x, y } = this;
    const length = Math.sqrt(x * x + y * y);
    this.x = x === 0 ? 0 : x / length;
    this.y = y === 0 ? 0 : y / length;
    return this;
  };

  public truncate = (maxForce: number): ForceVector =>
    this.normalize().multiplyBy(maxForce);

  public devide = (number: number): ForceVector => {
    this.x /= number;
    this.y /= number;
    return this;
  };
}
