import { Particle } from "./particle"
import { Scene } from "phaser"
import { Point } from "./point"
import { Board } from "./board"
import { Box } from "./box"

export interface Inaccuracy {
  min: number
  max: number
}
interface ParticleManagerConfig {
  amount: number
  initialPosition?: Point
  size?: number
  inaccuracy?: Inaccuracy
}

export type Particles = Array<Particle>

export class ParticleManager {
  private _particles: Particles
  private _amount: number
  private _size: number
  private _scene: Scene
  private _initialPosition: Point
  private _group: Phaser.GameObjects.Group
  private _inaccuracy: Inaccuracy
  constructor(
    scene: Scene,
    { amount, size = 5, initialPosition = new Point(0, 0), inaccuracy }: ParticleManagerConfig
  ) {
    this._scene = scene
    this._particles = []
    this._amount = amount
    this._size = size
    this._initialPosition = initialPosition
    this._group = scene.add.group()
    if (
      inaccuracy &&
      (typeof inaccuracy.max != "number" || typeof inaccuracy.min != "number" || inaccuracy.max < inaccuracy.min)
    ) {
      throw new Error("bad inaccuracy value")
    }
    this._inaccuracy = inaccuracy
    this.initManager()
  }

  private initManager = () => {
    const { _size: size, _initialPosition: initialPosition } = this
    for (let i = 0; i < this._amount; i++) {
      const particle = new Particle(this._scene, { initialPosition, size })
      this._group.add(particle)
      this._particles.push(particle)
    }
  }

  public moveByPath(board: Board): void {
    this._particles.forEach((particle: Particle) => {
      const { x, y } = particle
      const boxUnderParticle: Box = board.getBoxByDimensions(new Point(x, y))
      if (!boxUnderParticle) {
        console.warn("Particle Manager:\n", "Bad particle position\n", "(Inert motion)")
        particle.moveByVelocity()
        return
      }
      particle.setVelocity(boxUnderParticle.forceVector)
      if (this._inaccuracy) particle.moveWithInaccuracyByVelocity(this._inaccuracy)
      else particle.moveByVelocity()
    })
  }
}
