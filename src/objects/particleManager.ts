import * as PIXI from "pixi.js";
import { Particle } from "./particle";
import { Point } from "./point";
import { Board } from "./board";
import { Box } from "./box";
import { ForceVector } from "./forceVector";
import { ParticleScene } from "../engine/particleScene";

export interface Inaccuracy {
  min: number;
  max: number;
}
interface ParticleManagerConfig {
  tint?: number;
  alpha?: number;
  amount: number;
  initialPosition?: Point;
  size?: number;
  inaccuracy?: Inaccuracy;
  colisionBoard?: Board;
  particleTexture?: PIXI.Texture;
}

export type Particles = Array<Particle>;

export class ParticleManager {
  private static FORCE_PERCENTAGE_AFTER_COLLISION: number = 0.8;
  private static PARTICLE_DISTANCE_AFTER_COLISION: number = 2;
  private static DEFAULT_TINT: number = 0x00ffff;
  private static DEFAULT_ALPHA: number = 1;
  private _particles: Particles;
  private _amount: number;
  private _size: number;
  private _alpha: number;
  private _tint: number;
  private _scene: ParticleScene;
  private _initialPosition: Point;
  private _inaccuracy: Inaccuracy;
  private _colisionBoard: Board;
  private _particleTexture: PIXI.Texture = PIXI.Texture.WHITE;
  constructor(
    scene: ParticleScene,
    {
      amount,
      size = 5,
      initialPosition = new Point(0, 0),
      inaccuracy,
      colisionBoard,
      particleTexture,
      tint = ParticleManager.DEFAULT_TINT,
      alpha = ParticleManager.DEFAULT_ALPHA
    }: ParticleManagerConfig
  ) {
    this._alpha = alpha;
    this._tint = tint;
    this._colisionBoard = colisionBoard;
    this._scene = scene;
    this._particles = [];
    this._amount = amount;
    this._size = size;
    this._initialPosition = initialPosition;
    this._particleTexture = particleTexture;
    if (
      inaccuracy &&
      (typeof inaccuracy.max != "number" ||
        typeof inaccuracy.min != "number" ||
        inaccuracy.max < inaccuracy.min)
    ) {
      throw new Error("bad inaccuracy value");
    }
    this._inaccuracy = inaccuracy;
    this.initManager();
  }

  private initManager = () => {
    const {
      _size: size,
      _initialPosition: initialPosition,
      _particleTexture: particleTexture,
      _tint: tint,
      _alpha: alpha
    } = this;
    for (let i = 0; i < this._amount; i++) {
      const particle = new Particle({
        initialPosition,
        size,
        particleTexture,
        tint,
        alpha
      });
      this._particles.push(particle);
    }
    this._scene.addChild(...this._particles);
  };

  public moveByPath(board: Board): void {
    this._particles.forEach((particle: Particle) => {
      const { x, y } = particle;

      const boxUnderParticle: Box = board.getBoxByDimensions(new Point(x, y));
      if (!boxUnderParticle) {
        console.warn(
          "Particle Manager:\n",
          "Bad particle position\n",
          "(Inert motion)"
        );
        particle.moveByVelocity();
        return;
      }
      particle.setVelocity(boxUnderParticle.forceVector.copy());
    });
    this.checkColisions();

    this._particles.forEach((particle: Particle) => {
      if (this._inaccuracy)
        particle.moveWithInaccuracyByVelocity(this._inaccuracy);
      else particle.moveByVelocity();
    });
  }

  private checkColisions = (): void => {
    const boxSize = this._colisionBoard.boxSize;
    this._particles.forEach(particle => {
      const centerParticlePosition = particle.getCenterPosition();
      const boxPosition = this._colisionBoard.getBoxPositionByDimensions(
        new Point(centerParticlePosition.x, centerParticlePosition.y)
      );
      const {
        right,
        left,
        bottom,
        top
      } = this._colisionBoard.getNamedChildrens(boxPosition);
      if (
        bottom &&
        particle.y + this._size >= bottom.boxCenterPosition.y - boxSize * 0.65
      ) {
        particle.y =
          bottom.boxCenterPosition.y -
          boxSize * 0.65 -
          this._size -
          ParticleManager.PARTICLE_DISTANCE_AFTER_COLISION;
        particle.velocity = new ForceVector(
          particle.velocity.x,
          -particle.velocity.y *
            ParticleManager.FORCE_PERCENTAGE_AFTER_COLLISION
        );
      } else if (
        top &&
        particle.y - this._size <= top.boxCenterPosition.y + boxSize * 0.45
      ) {
        particle.y =
          top.boxCenterPosition.y +
          boxSize * 0.45 +
          this._size +
          ParticleManager.PARTICLE_DISTANCE_AFTER_COLISION;
        particle.velocity = new ForceVector(
          particle.velocity.x,
          -particle.velocity.y *
            ParticleManager.FORCE_PERCENTAGE_AFTER_COLLISION
        );
      } else if (
        left &&
        particle.x - this._size <= left.boxCenterPosition.x + boxSize * 0.45
      ) {
        particle.x =
          left.boxCenterPosition.x +
          boxSize * 0.45 +
          this._size +
          ParticleManager.PARTICLE_DISTANCE_AFTER_COLISION;
        particle.velocity = new ForceVector(
          -particle.velocity.x *
            ParticleManager.FORCE_PERCENTAGE_AFTER_COLLISION,
          particle.velocity.y
        );
      } else if (
        right &&
        particle.x + this._size >= right.boxCenterPosition.x - boxSize * 0.65
      ) {
        particle.x =
          right.boxCenterPosition.x -
          boxSize * 0.65 -
          this._size -
          ParticleManager.PARTICLE_DISTANCE_AFTER_COLISION;
        particle.velocity = new ForceVector(
          -particle.velocity.x *
            ParticleManager.FORCE_PERCENTAGE_AFTER_COLLISION,
          particle.velocity.y
        );
      }
    });
  };

  private checkParticleToParticleColisions = () => {
    // TODO: add colisions between particles
  };

  get particles(): Particles {
    return this._particles;
  }
}
