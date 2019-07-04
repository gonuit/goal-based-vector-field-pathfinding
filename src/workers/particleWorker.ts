import { PTMsgType } from "../workersObjects/PTMsgType";
import {
  WorkerShallowBoard,
  ShallowBox
} from "../workersObjects/workerShallowBoard";
import { ShallowParticle } from "../workersObjects/shallowParticle";
import { Point } from "../objects/point";

// // Worker.ts
const ctx: Worker = self as any;

class ParticleWorker {
  private _board: WorkerShallowBoard;
  private _colisionBoard: WorkerShallowBoard;
  private _particles: Array<ShallowParticle>;

  constructor() {
    this._particles = [];
  }

  public initParticles = (array: Array<number>, length: number) => {
    for (let i = 0; i < length; i++) {
      const x: number = array[i * 2];
      const y: number = array[i * 2 + 1];
      this._particles.push(
        new ShallowParticle({ initialPosition: new Point(x, y) })
      );
    }
  };
  public initValidBoard = (buffer: ArrayBuffer) => {
    this._board = new WorkerShallowBoard(buffer);
  };

  public initColisionBoard = (buffer: ArrayBuffer) => {
    this._colisionBoard = new WorkerShallowBoard(buffer);
  };

  public setVectors = (buffer: ArrayBuffer) => {
    const [
      horizontalBoxes,
      verticalBoxes,
      boxSize,
      boxCount,
      ...boxMap
    ] = new Float64Array(buffer);
    this._board.setShallowBoxMap(new Float64Array(boxMap));
  };

  private serializeParticles = (): ArrayBuffer => {
    const offset: number = 2;
    const array = new Array(this._particles.length + offset);
    array[0] = PTMsgType.updatedPositions;
    array[1] = this._particles.length;
    for (let i = 0; i < this._particles.length; i++) {
      const particle = this._particles[i];
      const firstElement = i * 2 + offset;
      array[firstElement] = particle.x;
      array[firstElement + 1] = particle.y;
    }
    return new Float64Array(array).buffer;
  };

  public updateParticlesPositions = (): ArrayBuffer => {
    if (!this._board) return undefined;
    for (let i = 0; i < this._particles.length; i++) {
      const particle: ShallowParticle = this._particles[i];
      const { x, y } = particle;
      const boxUnderParticle: ShallowBox = this._board.getBoxByDimensions(x, y);
      if (!boxUnderParticle) {
        // console.warn(
        //   "Particle Worker:\n",
        //   "Bad particle position\n",
        //   "(Inert motion)"
        // );
        particle.moveByVelocity();
      } else {
        particle
          .setVelocity(boxUnderParticle.forceVector)
          .checkColisions(this._colisionBoard)
          .moveWithInaccuracyByVelocity({ min: 0.5, max: 1 });
        // particle.moveByVelocity();
      }
    }
    // this.checkColisions();
    return this.serializeParticles();
  };
}

const particleWorker = new ParticleWorker();

onmessage = function({ data }) {
  // console.log("worker_data", data);
  const buff = new Float64Array(data.buff);
  const type: number = buff[0];

  switch (type) {
    case PTMsgType.init: {
      const [_, length, ...array] = buff;
      particleWorker.initParticles(array, length);
      particleWorker.initValidBoard(data.validBoardBuffer);
      particleWorker.initColisionBoard(data.colisionBoardBuffer);
      const initDoneBuffer: ArrayBuffer = new Float64Array([PTMsgType.initDone])
        .buffer;
      ctx.postMessage({ buff: initDoneBuffer }, [initDoneBuffer]);
      return;
    }
    case PTMsgType.setVectors: {
      particleWorker.setVectors(data.validBoardBuffer);
      const vectorsDoneBuffer: ArrayBuffer = new Float64Array([
        PTMsgType.setVectorsDone
      ]).buffer;
      ctx.postMessage({ buff: vectorsDoneBuffer }, [vectorsDoneBuffer]);
    }
    case PTMsgType.updatePositions: {
      const newParticlePositionsBuffer: ArrayBuffer = particleWorker.updateParticlesPositions();
      if (newParticlePositionsBuffer)
        ctx.postMessage({ buff: newParticlePositionsBuffer }, [
          newParticlePositionsBuffer
        ]);
      else return;
    }
    default: {
    }
  }
};

// Post data to parent thread
