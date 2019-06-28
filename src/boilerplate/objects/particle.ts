import { Point } from "./point";

export interface ParticleConfig extends GraphicsOptions {
  initialPosition?: Point;
  size?: number
}

export class Particle extends Phaser.GameObjects.Graphics {
  private _position: Point;
  private _size: number
  private _particleObject: Phaser.GameObjects.GameObject
  constructor(scene, params: ParticleConfig = {}) {
    super(scene, params);
    const { initialPosition = new Point(0, 0), size = 5 } = params
    this._position = initialPosition;
    this._size = size;
    // must be last
    this.initElement()
  }

  private initElement() {
    this.fillStyle(0x61e85b, 0.8);
    this.fillCircle(0, 0, this._size);
    this._particleObject = this.scene.add.existing(this);
  }

  public move({x, y}: Point) {
    this.x = x
    this.y = y
  }
}
