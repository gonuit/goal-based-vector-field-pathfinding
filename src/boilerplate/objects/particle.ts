import { Point } from "./point"
import { ForceVector } from "./forceVector"
import { Utils } from "./utils";
import { Inaccuracy } from "./particleManager";

export interface ParticleConfig extends GraphicsOptions {
  initialPosition?: Point
  size?: number
  mass?: number
}

export class Particle extends Phaser.GameObjects.Graphics {
  private static MAX_VELOCITY: number = 10
  private static MAX_FORCE: number = 0.2
  private static MAX_SPEED: number = 2
  private static DEFAULT_MASS: number = 1.5
  private _size: number
  private _mass: number
  private _steering: ForceVector
  private _velocity: ForceVector
  constructor(scene, params: ParticleConfig = {}) {
    super(scene, params)
    const { initialPosition = new Point(0, 0), size = 5, mass = Particle.DEFAULT_MASS } = params
    this._size = size
    this._mass = mass
    this.x = initialPosition.x
    this.y = initialPosition.y
    this._velocity = new ForceVector(0, 0)
    // must be last
    this.initElement()
  }

  private initElement() {
    this.fillStyle(0x61e85b, 0.8)
    this.fillCircle(0, 0, this._size)
    this.setDepth(10)
    this.scene.add.existing(this)
  }

  public setVelocity(newVelocity: ForceVector): Particle {
    this._steering = newVelocity
      .truncate(Particle.MAX_VELOCITY)
      .add(this._velocity)
      .truncate(Particle.MAX_FORCE)
      .devide(this._mass)
    this._velocity = this._velocity.add(this._steering).truncate(Particle.MAX_SPEED)

    return this
  }

  public get velocity(): ForceVector {
    return this._velocity
  }

  public set velocity(value: ForceVector) {
    this._velocity = value
  }

  public moveByVelocity(): Particle {
    this.x += this.velocity.x
    this.y += this.velocity.y
    return this
  }

  public moveWithInaccuracyByVelocity(inaccuracy: Inaccuracy): Particle {
    this.x += this.velocity.x * Utils.getRandomFloat(inaccuracy.max, inaccuracy.min)
    this.y += this.velocity.y * Utils.getRandomFloat(inaccuracy.max, inaccuracy.min)
    return this
  }

  public absoluteMoveTo({ x, y }: Point): Particle {
    this.x = x
    this.y = y
    return this
  }
}
