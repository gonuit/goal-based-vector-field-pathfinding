import { Particles } from "./particleManager";
import { Particle, ParticlePositionObject } from "./particle";

export interface ParticleThreadConfig {
  particles: Particles;
}

export enum PTMsgType {
  init,
  initDone
}


export class ParticleThread {
  private _worker: Worker;
  private _particles: Particles;
  constructor({ particles }: ParticleThreadConfig) {
    this._particles = particles;
    this._worker = require(`worker-loader?publicPath=dist/!../workers/particleWorker`)();
  }

  public init = () => {
    this.initListeners();
    console.time("1");
    const particlesArrayBuffer: ArrayBuffer = this.particlesToArrayBuffer()
    this._worker.postMessage({ buff: particlesArrayBuffer }, [particlesArrayBuffer]);
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
        console.log("worker_message_data", data);
        console.timeEnd("1");
        return;
      }
    }
  };

  private particlesToArrayBuffer = (): ArrayBuffer => {
    const arrayOfParticles = new Array(this._particles.length * 2 + 2);
    arrayOfParticles[0] = PTMsgType.init;
    arrayOfParticles[1] = this._particles.length;
    for (let i = 0; i < this._particles.length; i++) {
      const particle: Particle = this._particles[i];
      const targetArrayFirstPosition: number = i * 2
      arrayOfParticles[targetArrayFirstPosition] = particle.x
      arrayOfParticles[targetArrayFirstPosition + 1] = particle.y
    }
    return new Float64Array(arrayOfParticles).buffer
  };
}
