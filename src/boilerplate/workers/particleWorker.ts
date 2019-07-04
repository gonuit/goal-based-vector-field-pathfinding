import { Board } from "../objects/board";
import {
  WorkerParticle,
  WorkerParticles
} from "../workersObjects/workerParticle";
import { PTMsgType } from "../workersObjects/PTMsgType";
import { WorkerShallowBoard } from "../workersObjects/workerShallowBoard";

// // Worker.ts
const ctx: Worker = self as any;

class ParticleWorker {
  private _board: WorkerShallowBoard;
  private _colisionBoard: WorkerShallowBoard;
  private _particles: WorkerParticles;

  constructor() {
    this._particles = [];
  }

  public initParticles = (array: Array<number>, length: number) => {
    for (let i = 0; i < length; i++) {
      const x: number = array[i * 2];
      const y: number = array[i * 2 + 1];
      this._particles.push(new WorkerParticle(x, y));
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

  public updateParticlesPositions = () => {

  }
}

const particleWorker = new ParticleWorker();

onmessage = function({ data }) {
  console.log("worker_data", data);
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
      particleWorker.setVectors(data.validBoardBuffer)
      const vectorsDoneBuffer: ArrayBuffer = new Float64Array([PTMsgType.setVectorsDone])
        .buffer;
      ctx.postMessage({ buff: vectorsDoneBuffer }, [vectorsDoneBuffer]);
    }
    case PTMsgType.updatePosition: {
      const newParticlePositions = particleWorker.updateParticlesPositions()
    }
  }
};

// Post data to parent thread
