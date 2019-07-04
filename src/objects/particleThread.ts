import { Particles } from "./particleManager";
import { Particle } from "./particle";
import { PTMsgType } from "../workersObjects/PTMsgType";
import { Board } from "./board";

export interface ParticleThreadConfig {
  particles: Particles;
  colisionBoard: Board;
  validBoard: Board;
}

export class ParticleThread {
  private _worker: Worker;
  private _colisionBoard: Board;
  private _validBoard: Board;
  private _particles: Particles;
  constructor({ particles, colisionBoard, validBoard }: ParticleThreadConfig) {
    this._particles = particles;
    this._validBoard = validBoard;
    this._colisionBoard = colisionBoard;
    this._worker = require(`worker-loader?publicPath=dist/!../workers/particleWorker`)();
  }

  public init = () => {
    this.initListeners();
    const validBoardBuffer: ArrayBuffer = this._validBoard.toArrayBuffer();
    const colisionBoardBuffer: ArrayBuffer = this._colisionBoard.toArrayBuffer();
    const particlesArrayBuffer: ArrayBuffer = this.particlesToArrayBuffer();
    this._worker.postMessage(
      { buff: particlesArrayBuffer, validBoardBuffer, colisionBoardBuffer },
      [particlesArrayBuffer, validBoardBuffer, colisionBoardBuffer]
    );
  };

  private initListeners = () => {
    this._worker.addEventListener("message", this.handleMessage);
  };

  private handleMessage = ({ data }: MessageEvent) => {
    const [type, ...rest] = new Float64Array(data.buff);
    switch (type) {
      case PTMsgType.initDone: {
        return;
      }
      case PTMsgType.setVectorsDone: {
        return;
      }
      case PTMsgType.updatedPositions: {
        this.updateParticleGameObjectsPositons(rest);
        return;
      }
      default: {
        console.log("worker_message_data", new Float64Array(data.buff));
        return;
      }
    }
  };

  private updateParticleGameObjectsPositons = (
    serializedParticles: Array<number>
  ) => {
    const length: number = serializedParticles[0];
    const offset = 1;
    for (let i = 0; i < length; i++) {
      const firstElement = i * 2 + offset;
      const x: number = serializedParticles[firstElement];
      const y: number = serializedParticles[firstElement + 1];
      this._particles[i].x = x;
      this._particles[i].y = y;
    }
  };

  public updateBoardVectors = () => {
    const validBoardBuffer: ArrayBuffer = this._validBoard.toArrayBuffer();
    const type = new Float64Array([PTMsgType.setVectors]).buffer;
    this._worker.postMessage({ buff: type, validBoardBuffer }, [
      validBoardBuffer,
      type
    ]);
  };

  public updateParticlesPositions = () => {
    const buff: ArrayBuffer = new Float64Array([PTMsgType.updatePositions])
      .buffer;
    this._worker.postMessage({ buff }, [buff]);
  };

  private particlesToArrayBuffer = (): ArrayBuffer => {
    const arrayOfParticles = new Array(this._particles.length * 2 + 2);
    const offset: number = 2;
    arrayOfParticles[0] = PTMsgType.init;
    arrayOfParticles[1] = this._particles.length;
    for (let i = 0; i < this._particles.length; i++) {
      const particle: Particle = this._particles[i];
      const targetArrayFirstPosition: number = i * 2 + offset;
      arrayOfParticles[targetArrayFirstPosition] = particle.x;
      arrayOfParticles[targetArrayFirstPosition + 1] = particle.y;
    }
    return new Float64Array(arrayOfParticles).buffer;
  };
}
