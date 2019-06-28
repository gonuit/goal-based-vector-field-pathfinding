import { Particle } from "./particle";

interface ParticleManagerConfig {
  amount: number
  size?: number
}

export type Particles = Array<Particle>

export class ParticleManager {
  private _particles: Particles
  constructor({  }: ParticleManagerConfig) {

    initManager
  }

  private initManager = () => {

  }
}