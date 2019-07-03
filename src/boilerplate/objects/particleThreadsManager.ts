import { Board } from "./board";
import { ParticleManager } from "./particleManager";

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
  private _boxesLocations: BoxesLocations;
  constructor({
    board,
    colisionBoard,
    particleManager,
    numberOfThreads = ParticleThreadsManager.BASIC_THREAD_COUNT
  }: ParticleThreadsManagerConfig) {
    console.log("ParticleThreadsManager constructor");
    this._board = board;
    this._colisionBoard = colisionBoard;
    this._particleManager = particleManager;
    this._numberOfThreads = numberOfThreads;
  }
}
