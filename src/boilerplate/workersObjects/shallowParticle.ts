import { Point } from "../objects/point";
import { ForceVector } from "../objects/forceVector";
import { Inaccuracy } from "../objects/particleManager";
import { Utils } from "../objects/utils";

export interface ShallowParticleConfig extends GraphicsOptions {
  initialPosition?: Point;
  size?: number;
  mass?: number;
}

export class ShallowParticle {
  private static MAX_VELOCITY: number = 10;
  private static MAX_FORCE: number = 0.2;
  private static MAX_SPEED: number = 2;
  private static DEFAULT_MASS: number = 1.5;
  public x: number;
  public y: number;
  private _size: number;
  private _mass: number;
  private _steering: ForceVector;
  private _velocity: ForceVector;
  constructor(config: ShallowParticleConfig = {}) {
    const {
      initialPosition = new Point(0, 0),
      size = 5,
      mass = ShallowParticle.DEFAULT_MASS
    } = config;
    this._size = size;
    this._mass = mass;
    this.x = initialPosition.x;
    this.y = initialPosition.y;
    this._velocity = new ForceVector(0, 0);
  }

  public setVelocity(newVelocity: ForceVector): ShallowParticle {
    this._steering = newVelocity
      .copy()
      .truncate(ShallowParticle.MAX_VELOCITY)
      .add(this._velocity)
      .truncate(ShallowParticle.MAX_FORCE)
      .devide(this._mass);
    this._velocity.add(this._steering).truncate(ShallowParticle.MAX_SPEED);

    return this;
  }

  public get velocity(): ForceVector {
    return this._velocity;
  }

  public set velocity(value: ForceVector) {
    this._velocity = value;
  }

  public moveByVelocity(): ShallowParticle {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    return this;
  }

  public moveWithInaccuracyByVelocity(inaccuracy: Inaccuracy): ShallowParticle {
    this.x +=
      this.velocity.x * Utils.getRandomFloat(inaccuracy.max, inaccuracy.min);
    this.y +=
      this.velocity.y * Utils.getRandomFloat(inaccuracy.max, inaccuracy.min);
    return this;
  }

  public absoluteMoveTo({ x, y }: Point): ShallowParticle {
    this.x = x;
    this.y = y;
    return this;
  }

  public toParticlePositionObject = () => ({
    x: this.x,
    y: this.y
  });
}
