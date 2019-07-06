import { Point } from "../objects/point";
import { ForceVector } from "../objects/forceVector";
import { Inaccuracy } from "../objects/particleManager";
import { Utils } from "../objects/utils";
import { WorkerShallowBoard } from "./workerShallowBoard";

export interface ShallowParticleConfig {
  initialPosition?: Point;
  size?: number;
  mass?: number;
}

export class ShallowParticle {
  private static FORCE_PERCENTAGE_AFTER_COLLISION: number = 0.8;
  private static PARTICLE_DISTANCE_AFTER_COLISION: number = 2;
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

  private getCenterPosition = (): { x: number; y: number } => ({
    x: this.x + this._size * 0.5,
    y: this.y + this._size * 0.5
  });

  public checkColisions = (
    colisionBoard: WorkerShallowBoard
  ): ShallowParticle => {
    const boxSize = colisionBoard.boxSize;
    const centerParticlePosition = this.getCenterPosition();
    const boxPosition = colisionBoard.getBoxPositionByDimensions(
      centerParticlePosition.x,
      centerParticlePosition.y
    );
    const {
      right,
      left,
      bottom,
      top,
      topRight,
      topLeft,
      bottomLeft,
      bottomRight
    } = colisionBoard.getShallowNamedChildrens(boxPosition.x, boxPosition.y);

    const inaccuracy = {
      min: 0.1,
      max: 1,
    }
    if (
      bottom &&
      this.y + this._size >= bottom.centerPositionY - boxSize * 0.65
    ) {
      this.y =
        bottom.centerPositionY -
        boxSize * 0.65 -
        this._size -
        ShallowParticle.PARTICLE_DISTANCE_AFTER_COLISION;
      this.velocity = new ForceVector(
        this.velocity.x,
        -this.velocity.y * Utils.getRandomFloat(inaccuracy.max, inaccuracy.min)
      );
    } else if (
      top &&
      this.y - this._size <= top.centerPositionY + boxSize * 0.47
    ) {
      this.y =
        top.centerPositionY +
        boxSize * 0.47 +
        this._size +
        ShallowParticle.PARTICLE_DISTANCE_AFTER_COLISION;
      this.velocity = new ForceVector(
        this.velocity.x,
        -this.velocity.y * Utils.getRandomFloat(inaccuracy.max, inaccuracy.min)
      );
    } else if (
      left &&
      this.x - this._size <= left.centerPositionX + boxSize * 0.47
    ) {
      this.x =
        left.centerPositionX +
        boxSize * 0.47 +
        this._size +
        ShallowParticle.PARTICLE_DISTANCE_AFTER_COLISION;
      this.velocity = new ForceVector(
        -this.velocity.x * Utils.getRandomFloat(inaccuracy.max, inaccuracy.min),
        this.velocity.y
      );
    } else if (
      right &&
      this.x + this._size >= right.centerPositionX - boxSize * 0.65
    ) {
      this.x =
        right.centerPositionX -
        boxSize * 0.65 -
        this._size -
        ShallowParticle.PARTICLE_DISTANCE_AFTER_COLISION;
      this.velocity = new ForceVector(
        -this.velocity.x * Utils.getRandomFloat(inaccuracy.max, inaccuracy.min),
        this.velocity.y
      );
    } else if (
      topRight &&
      this.x + this._size >= topRight.centerPositionX - boxSize * 0.65 &&
      this.y - this._size <= topRight.centerPositionY + boxSize * 0.47
    ) {
      this.x =
        topRight.centerPositionX -
        boxSize * 0.65 -
        this._size -
        ShallowParticle.PARTICLE_DISTANCE_AFTER_COLISION;
      this.y =
        topRight.centerPositionY +
        boxSize * 0.65 +
        this._size +
        ShallowParticle.PARTICLE_DISTANCE_AFTER_COLISION;
      this.velocity = new ForceVector(
        -this.velocity.x * Utils.getRandomFloat(inaccuracy.max, inaccuracy.min),
        this.velocity.y * Utils.getRandomFloat(inaccuracy.max, inaccuracy.min)
      );
    } else if (
      topLeft &&
      this.x - this._size <= topLeft.centerPositionX + boxSize * 0.47 &&
      this.y - this._size <= topLeft.centerPositionY + boxSize * 0.47
    ) {
      this.x =
        topLeft.centerPositionX +
        boxSize * 0.65 +
        this._size +
        ShallowParticle.PARTICLE_DISTANCE_AFTER_COLISION;
      this.y =
        topLeft.centerPositionY +
        boxSize * 0.65 +
        this._size +
        ShallowParticle.PARTICLE_DISTANCE_AFTER_COLISION;
      this.velocity = new ForceVector(
        -this.velocity.x * Utils.getRandomFloat(inaccuracy.max, inaccuracy.min),
        this.velocity.y * Utils.getRandomFloat(inaccuracy.max, inaccuracy.min)
      );
    } else if (
      bottomLeft &&
      this.x - this._size <= bottomLeft.centerPositionX + boxSize * 0.47 &&
      this.y + this._size >= bottomLeft.centerPositionY - boxSize * 0.65
    ) {
      this.x =
        bottomLeft.centerPositionX +
        boxSize * 0.65 +
        this._size +
        ShallowParticle.PARTICLE_DISTANCE_AFTER_COLISION;
      this.y =
        bottomLeft.centerPositionY -
        boxSize * 0.65 -
        this._size -
        ShallowParticle.PARTICLE_DISTANCE_AFTER_COLISION;
      this.velocity = new ForceVector(
        -this.velocity.x * Utils.getRandomFloat(inaccuracy.max, inaccuracy.min),
        this.velocity.y * Utils.getRandomFloat(inaccuracy.max, inaccuracy.min)
      );
    } else if (
      bottomRight &&
      this.x + this._size >= bottomRight.centerPositionX - boxSize * 0.65 &&
      this.y + this._size >= bottomRight.centerPositionY - boxSize * 0.65
    ) {
      this.x =
        bottomRight.centerPositionX -
        boxSize * 0.65 -
        this._size -
        ShallowParticle.PARTICLE_DISTANCE_AFTER_COLISION;
      this.y =
        bottomRight.centerPositionY -
        boxSize * 0.65 -
        this._size -
        ShallowParticle.PARTICLE_DISTANCE_AFTER_COLISION;
      this.velocity = new ForceVector(
        -this.velocity.x * Utils.getRandomFloat(inaccuracy.max, inaccuracy.min),
        this.velocity.y * Utils.getRandomFloat(inaccuracy.max, inaccuracy.min)
      );
    }
    return this;
  };
}
