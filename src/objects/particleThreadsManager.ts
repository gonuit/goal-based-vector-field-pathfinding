import { Board } from "./board";
import { ParticleManager, Particles } from "./particleManager";
import { ParticleThread } from "./ParticleThread";

export interface ItemPosition {
  x: number;
  y: number;
}

export interface ParticleLocation extends ItemPosition {}

export interface BoxLocation extends ItemPosition {}

export type ParticlesLocations = Array<ParticleLocation>;
export type BoxesLocations = Array<BoxLocation>;

export interface ParticleThreadsManagerConfig {
  particleManager: ParticleManager;
  numberOfThreads?: number;
  board: Board;
  colisionBoard: Board;
}

export class ParticleThreadsManager {
  private static BASIC_THREAD_COUNT: number = 1;
  private _board: Board;
  private _colisionBoard: Board;
  private _particleManager: ParticleManager;
  private _numberOfThreads: number;
  private _particleThreads: Array<ParticleThread>

  private _particlesSubArrays: Array<Particles>;
  constructor({
    board,
    colisionBoard,
    particleManager,
    numberOfThreads = ParticleThreadsManager.BASIC_THREAD_COUNT
  }: ParticleThreadsManagerConfig) {
    this._board = board;
    this._colisionBoard = colisionBoard;
    this._particleManager = particleManager;
    this._numberOfThreads = numberOfThreads;
    this._particlesSubArrays = [];

    this.init();
  }

  init = () => {
    this.initParticlesSubArrays();
    this.initWebWorkers();
  };
  initParticlesSubArrays = () => {
    const particles: Particles = this._particleManager.particles;
    const particlesPerThread: number = Math.round(
      particles.length / this._numberOfThreads
    );
    for (let i = 0; i < this._numberOfThreads; i++) {
      const particlesSubArray: Particles = particles.slice(
        i * particlesPerThread,
        i + 1 === this._numberOfThreads
          ? particles.length
          : i * particlesPerThread + particlesPerThread
      );
      this._particlesSubArrays.push(particlesSubArray);
    }
  };
  private initWebWorkers = () => {
    this._particleThreads = new Array(this._numberOfThreads)
    for (let i = 0; i < this._numberOfThreads; i++) {
      const particleThread: ParticleThread = new ParticleThread({
        particles: this._particlesSubArrays[i],
        validBoard: this._board,
        colisionBoard: this._colisionBoard
      });
      particleThread.init();
      this._particleThreads[i] = particleThread
    }
  };

  public updateBoardVectors = () => {
    for(let i = 0; i < this._particleThreads.length; i++) {
      this._particleThreads[i].updateBoardVectors()
    }
  }

  public updateParticlesPositions = () => {
    for(let i = 0; i < this._particleThreads.length; i++) {
      this._particleThreads[i].updateParticlesPositions()
    }
  }
}
