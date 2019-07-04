import * as PIXI from "pixi.js";
import { Point } from "./point";
import { ForceVector } from "./forceVector";
import { Utils } from "./utils";
import { Inaccuracy } from "./particleManager";
import { ParticleScene } from "../engine/particleScene";

export interface ParticleConfig extends GraphicsOptions {
  initialPosition?: Point;
  size?: number;
  mass?: number;
}

export class Particle extends PIXI.Sprite {
  private static MAX_VELOCITY: number = 10;
  private static MAX_FORCE: number = 0.2;
  private static MAX_SPEED: number = 2;
  private static DEFAULT_MASS: number = 1.5;
  private _size: number;
  private _mass: number;
  private _steering: ForceVector;
  private _velocity: ForceVector;
  private _scene: ParticleScene;
  constructor(scene, params: ParticleConfig = {}) {
    super(PIXI.Texture.WHITE);
    const {
      initialPosition = new Point(0, 0),
      size = 5,
      mass = Particle.DEFAULT_MASS
    } = params;
    this._scene = scene;
    this._size = size;
    this._mass = mass;
    this.position.x = initialPosition.x;
    this.position.y = initialPosition.y;
    this._velocity = new ForceVector(0, 0);
    // must be last
    this.initElement();
  }

  private initElement() {
    this.texture = PIXI.Texture.from("../../assets/image/particle.png");
    this.tint = 0x00ffff;
    this.zIndex = 100;
  }

  public setVelocity(newVelocity: ForceVector): Particle {
    this._steering = newVelocity
      .truncate(Particle.MAX_VELOCITY)
      .add(this._velocity)
      .truncate(Particle.MAX_FORCE)
      .devide(this._mass);
    this._velocity = this._velocity
      .add(this._steering)
      .truncate(Particle.MAX_SPEED);

    return this;
  }

  public get velocity(): ForceVector {
    return this._velocity;
  }

  public set velocity(value: ForceVector) {
    this._velocity = value;
  }

  public moveByVelocity(): Particle {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    return this;
  }

  public moveWithInaccuracyByVelocity(inaccuracy: Inaccuracy): Particle {
    this.x +=
      this.velocity.x * Utils.getRandomFloat(inaccuracy.max, inaccuracy.min);
    this.y +=
      this.velocity.y * Utils.getRandomFloat(inaccuracy.max, inaccuracy.min);
    return this;
  }

  public absoluteMoveTo({ x, y }: Point): Particle {
    this.x = x;
    this.y = y;
    return this;
  }

  public toParticlePositionObject = () => ({
    x: this.x,
    y: this.y
  });

  public getCenterPosition = (): Point =>
    new Point(this.x + this._size * 0.5, this.y + this._size * 0.5);
}
