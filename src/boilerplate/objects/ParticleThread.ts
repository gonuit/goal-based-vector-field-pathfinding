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
    const validBoardBuffer: ArrayBuffer =  this._validBoard.toArrayBuffer();
    const colisionBoardBuffer: ArrayBuffer =  this._colisionBoard.toArrayBuffer();
    const particlesArrayBuffer: ArrayBuffer = this.particlesToArrayBuffer();
    console.time("1");
    this._worker.postMessage({ buff: particlesArrayBuffer, validBoardBuffer, colisionBoardBuffer }, [
      particlesArrayBuffer,
      validBoardBuffer,
      colisionBoardBuffer
    ]);
  };

  private initListeners = () => {
    this._worker.addEventListener("message", this.handleMessage);
  };

  private handleMessage = ({ data }: MessageEvent) => {
    switch (data.type) {
      case PTMsgType.initDone: {
        return;
      }
      default: {
        console.timeEnd("1");
        console.log("worker_message_data", data);
        return;
      }
    }
  };

  updateBoardVectors = () => {
    const validBoardBuffer: ArrayBuffer =  this._validBoard.toArrayBuffer();
    console.time("1");
    this._worker.postMessage({ buff: [PTMsgType.setVectors], validBoardBuffer, }, [validBoardBuffer])
  }

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
