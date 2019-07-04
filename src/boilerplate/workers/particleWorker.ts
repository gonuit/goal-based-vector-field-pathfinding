import { Board } from "../objects/board";
import { WorkerParticle, WorkerParticles } from "../workersObjects/workerParticle";
import { PTMsgType } from "../workersObjects/PTMsgType";
import { WorkerShallowBoard } from "../workersObjects/workerShallowBoard";

// // Worker.ts
const ctx: Worker = self as any;

class ParticleWorker {
  private _board: WorkerShallowBoard;
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
    console.log('_particles', this._particles)
  };
}

const particleWorker = new ParticleWorker();

onmessage = function({ data }) {
  console.log("worker_data", data);
  const buff = new Float64Array(data.buff);
  const [type, length, ...array] = buff;

  switch (type) {
    case PTMsgType.init: {
      particleWorker.initParticles(array, length);
      const initDoneBuffer: ArrayBuffer = new Float64Array([PTMsgType.initDone])
        .buffer;
      ctx.postMessage({ buff: initDoneBuffer }, [initDoneBuffer]);
      return;
    }
  }
};

// Post data to parent thread
