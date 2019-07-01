import { WorkerThread } from "./workerThread";

export class ParticleThread extends WorkerThread {
  worker: Worker;
  constructor() {
    super()
    this.worker = require(`worker-loader?publicPath=dist/!../workers/particleWorker`)();  
  }
}