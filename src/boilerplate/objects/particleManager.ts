import { Particle } from "./particle"
import { Scene } from "phaser"
import { Point } from "./point"
import { Board } from "./board"
import { Box } from "./box"

interface ParticleManagerConfig {
  amount: number
  initialPosition?: Point
  size?: number
}

export type Particles = Array<Particle>

export class ParticleManager {
  private _particles: Particles
  private _amount: number
  private _size: number
  private _scene: Scene
  private _initialPosition: Point
  private _group: Phaser.GameObjects.Group
  constructor(scene: Scene, { amount, size = 5, initialPosition = new Point(0, 0) }: ParticleManagerConfig) {
    this._scene = scene
    this._particles = []
    this._amount = amount
    this._size = size
    this._initialPosition = initialPosition
    this._group = scene.add.group()
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

  public moveByPath(board: Board) {
    this._particles.forEach((particle) => {
      const { x, y } = particle
      const boxUnderParticle: Box = board.getBoxByDimensions(new Point(x, y))
      particle.x += boxUnderParticle.forceVector.x
      particle.y += boxUnderParticle.forceVector.y
    })
  }
}
