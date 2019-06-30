import { Particle } from "./particle"
import { Scene, RIGHT } from "phaser"
import { Point } from "./point"
import { Board } from "./board"
import { Box } from "./box"
import { ForceVector } from "./forceVector"

export interface Inaccuracy {
  min: number
  max: number
}
interface ParticleManagerConfig {
  amount: number
  initialPosition?: Point
  size?: number
  inaccuracy?: Inaccuracy
  colisionBoard?: Board
}

export type Particles = Array<Particle>

export class ParticleManager {
  private static FORCE_PERCENTAGE_AFTER_COLLISION: number = 0.8
  private static PARTICLE_DISTANCE_AFTER_COLISION: number = 2
  private _particles: Particles
  private _amount: number
  private _size: number
  private _scene: Scene
  private _initialPosition: Point
  private _group: Phaser.GameObjects.Group
  private _inaccuracy: Inaccuracy
  private _colisionBoard: Board
  constructor(
    scene: Scene,
    { amount, size = 5, initialPosition = new Point(0, 0), inaccuracy, colisionBoard }: ParticleManagerConfig
  ) {
    this._colisionBoard = colisionBoard
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
      const particle = new Particle(this._scene, { initialPosition, size, fillStyle: { color: 0xff0000 } })
      // particle.fillStyle(0xff0000)
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
    })
    this.checkColisions()
    this._particles.forEach((particle: Particle) => {
      if (this._inaccuracy) particle.moveWithInaccuracyByVelocity(this._inaccuracy)
      else particle.moveByVelocity()
    })
  }

  private checkColisions = (): void => {
    const boxSize = this._colisionBoard.boxSize
    this._particles.forEach((particle) => {
      const boxPosition = this._colisionBoard.getBoxPositionByDimensions(new Point(particle.x, particle.y))
      const { right, left, bottom, top } = this._colisionBoard.getNamedChildrens(boxPosition)
      if (bottom && particle.y + this._size >= bottom.rectanglePosition.y - boxSize / 2) {
        particle.y = bottom.rectanglePosition.y - boxSize / 2 - this._size - ParticleManager.PARTICLE_DISTANCE_AFTER_COLISION
        particle.velocity = new ForceVector(particle.velocity.x, -particle.velocity.y * ParticleManager.FORCE_PERCENTAGE_AFTER_COLLISION)
      }
      if (top && particle.y - this._size <= top.rectanglePosition.y + boxSize / 2) {
        particle.y = top.rectanglePosition.y + boxSize / 2 + this._size + ParticleManager.PARTICLE_DISTANCE_AFTER_COLISION
        particle.velocity = new ForceVector(particle.velocity.x, -particle.velocity.y * ParticleManager.FORCE_PERCENTAGE_AFTER_COLLISION)
      }
      if (left && particle.x - this._size <= left.rectanglePosition.x + boxSize / 2) {
        particle.x = left.rectanglePosition.x + boxSize / 2 + this._size + ParticleManager.PARTICLE_DISTANCE_AFTER_COLISION
        particle.velocity = new ForceVector(-particle.velocity.x * ParticleManager.FORCE_PERCENTAGE_AFTER_COLLISION, particle.velocity.y)
      }
      if (right && particle.x + this._size >= right.rectanglePosition.x - boxSize / 2) {
        particle.x = right.rectanglePosition.x - boxSize / 2 - this._size - ParticleManager.PARTICLE_DISTANCE_AFTER_COLISION
        particle.velocity = new ForceVector(-particle.velocity.x * ParticleManager.FORCE_PERCENTAGE_AFTER_COLLISION, particle.velocity.y)
      }
    })
  }

  private checkParticleToParticleColisions = () => {
    // TODO: add colisions between particles
  }
}
