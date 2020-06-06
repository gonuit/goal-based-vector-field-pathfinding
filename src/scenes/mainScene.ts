import * as PIXI from 'pixi.js';
import { ParticleScene, ParticleSceneConfig } from '../engine/particleScene';
import { Point } from '../objects/point';
import { Board } from '../objects/board';
import { Statistics } from '../objects/statistics';
import { Scene } from '../engine/scene';
import { ParticleThreadsManager } from '../engine/particleThreadsManager';
import { ParticleManager } from '../engine/particleManager';
import { TileMap } from '../engine/tileMap';

interface MainSceneConfig extends ParticleSceneConfig {
  tileMap: TileMap;
  threadsCount?: number;
  particlesCount?: number;
  maxParticlesCount?: number;
}

const THREADS_COUNT: number = 2;
const PARTICLES_COUNT: number = 2000;
const MAX_PARTICLES_COUNT: number = 10000;

export class MainScene extends Scene {
  private threadsCount: number;
  private particlesCount: number;
  private maxParticlesCount: number;
  private _tileMap: TileMap;
  constructor({
    name,
    tileMap,
    maxParticlesCount = MAX_PARTICLES_COUNT,
    threadsCount = THREADS_COUNT,
    particlesCount = PARTICLES_COUNT,
  }: MainSceneConfig) {
    super({
      name,

      withMouse: true,
    });

    this.maxParticlesCount = maxParticlesCount;
    this.threadsCount = threadsCount;
    this.particlesCount = particlesCount;

    this._tileMap = tileMap;
    // TODO: Fix needed
    this.particleScene = new ParticleScene({
      name: 'SUB_MAIN',
      maxParticleCount: this.maxParticlesCount,
      withMouse: false,
    });
    this.particleScene.visible = true;
    this.particleScene.zIndex = 1000;
    this.stage = new Scene({ withMouse: false, name: 'scene' });
    this.addChild(this.stage);
    this.addChild(this.particleScene);
  }
  private stage: Scene;
  private particleScene: ParticleScene;

  private fieldSize: number;
  private horizontalBoxes: number;
  private verticalBoxes: number;

  private ui: Statistics;

  private validBoard: Board;
  private colisionBoard: Board;
  private isTrackingPaused: boolean;
  private inertia: boolean;
  private inertiaInitialized: boolean;
  private isSingleThread: boolean;

  private info: PIXI.BitmapText;
  private helpText: PIXI.BitmapText;
  private authorText: PIXI.BitmapText;

  private particleThreadsManager: ParticleThreadsManager;
  private particleManager: ParticleManager;

  init = () => {
    this.isSingleThread = !this.hasBrowserWebWorkersSupport();
    this.isTrackingPaused = false;
    this.fieldSize = 40;
    this.ui = new Statistics(this);
    this.horizontalBoxes = this._tileMap.horizontalBoxes;
    this.verticalBoxes = this._tileMap.verticalBoxes;
  };

  preload = async () => {
    let options = { crossOrigin: true };
    const loader = new PIXI.Loader();
    loader.add('font', 'assets/font/font.fnt', options);
    await new Promise((res, rej) => {
      loader.onComplete.add(res);
      loader.load();
    });
  };

  create = () => {
    // this.stats.displayFPS(true);
    this.initEvents();

    this.colisionBoard = new Board(this.stage, {
      horizontalBoxes: this.horizontalBoxes,
      initialRendererConfig: { color: { r: 50, a: 1, g: 200, b: 0 } },
      verticalBoxes: this.verticalBoxes,
      boxSize: this.fieldSize,
      initAll: false,
      positionsToFill: this._tileMap.map,
    }).render();

    this.validBoard = new Board(this.stage, {
      horizontalBoxes: this.horizontalBoxes,
      verticalBoxes: this.verticalBoxes,
      boxSize: this.fieldSize,
    }).removeFromBoard(this.colisionBoard);

    this.validBoard.rendererConfig = {
      color: { r: 0, g: 0, b: 0, a: 1 },
      renderVectorLines: false,
      colorByDistance: false,
    };

    this.particleManager = new ParticleManager(this.particleScene, {
      amount: this.particlesCount,
      inaccuracy: { min: 0.5, max: 1 },
      initialPosition: new Point(100, 100),
      colisionBoard: this.colisionBoard,
      particleTexture: PIXI.Texture.from('../../assets/image/particle.png'),
      tint: 0x00ffff,
      alpha: 0.5,
    });

    this.particleThreadsManager = new ParticleThreadsManager({
      board: this.validBoard,
      colisionBoard: this.colisionBoard,
      particleManager: this.particleManager,
      numberOfThreads: this.threadsCount,
    });

    this.initText();
  };

  update = () => {
    this.ui;
    if (!this.isTrackingPaused) {
      const { x: mouseX, y: mouseY } = this.input.mouse.position;
      const hoverBoxPosition: Point = this.validBoard.getBoxPositionByDimensions(
        new Point(mouseX, mouseY),
      );
      const boxExist = this.validBoard.exist(hoverBoxPosition);
      if (boxExist && !this.validBoard.goalPosition.equals(hoverBoxPosition)) {
        this.validBoard = this.validBoard
          .calculateBoxesDistance(hoverBoxPosition)
          .render();
        if (!this.isSingleThread)
          this.particleThreadsManager.updateBoardVectors();
      } else if (
        this.validBoard.rendererConfig.indicateBoardRefresh &&
        this.validBoard.indicateRefresh
      ) {
        this.validBoard = this.validBoard.render();
      }
    } else if (this.inertia && !this.inertiaInitialized) {
      this.inertiaInitialized = true;
      this.validBoard = this.validBoard.reset().render();
      if (!this.isSingleThread)
        this.particleThreadsManager.updateBoardVectors();
    }
    if (this.isSingleThread) this.particleManager.moveByPath(this.validBoard);
    else this.particleThreadsManager.updateParticlesPositions();
  };

  unmount = () => {};

  destroy = () => {};

  private hasBrowserWebWorkersSupport = (): boolean =>
    Boolean((window as any).Worker);

  private initText = () => {
    this.info = new PIXI.BitmapText(
      `Threads: ${this.isSingleThread ? 1 : this.threadsCount + 1} Particles: ${
        this.particlesCount
      }`,
      {
        font: { name: 'font', size: 11 },
        tint: 0x000000,
      },
    );
    this.helpText = new PIXI.BitmapText(
      `Shift: turn off tracking \nSpace: pause tracking\n1,2,3,4: pathfinding debug view   `,
      {
        font: { name: 'font', size: 8 },
        tint: 0x000000,
      },
    );
    this.authorText = new PIXI.BitmapText(`Author github id: gonuit`, {
      font: { name: 'font', size: 8 },
      tint: 0x000000,
    });
    this.authorText.x = 630;
    this.authorText.y = 825;
    this.authorText.zIndex = 50;
    this.stage.addChild(this.authorText);
    this.info.x = 40;
    this.info.y = 25;
    this.info.zIndex = 50;
    this.stage.addChild(this.info);
    this.helpText.x = 40;
    this.helpText.y = 810;
    this.helpText.zIndex = 50;
    this.stage.addChild(this.helpText);
  };

  private initEvents = () => {
    document.body.addEventListener('keyup', this.handleKeyboardEvent);
  };

  private handleKeyboardEvent = (event: KeyboardEvent) => {
    switch (event.key) {
      case '1': {
        this.validBoard.rendererConfig = {
          ...this.validBoard.rendererConfig,
          colorByDistance: !this.validBoard.rendererConfig.colorByDistance,
        };
        return;
      }
      case '2': {
        this.validBoard.rendererConfig = {
          ...this.validBoard.rendererConfig,
          renderDistances: !this.validBoard.rendererConfig.renderDistances,
          renderVectorLines: false,
        };
        return;
      }
      case '3': {
        this.validBoard.rendererConfig = {
          ...this.validBoard.rendererConfig,
          renderVectorLines: !this.validBoard.rendererConfig.renderVectorLines,
          renderDistances: false,
        };
        return;
      }
      case '4': {
        this.validBoard.rendererConfig = {
          ...this.validBoard.rendererConfig,
          indicateBoardRefresh: !this.validBoard.rendererConfig
            .indicateBoardRefresh,
        };
        return;
      }
      case ' ': {
        this.isTrackingPaused = !this.isTrackingPaused;
        this.inertia = false;
        return;
      }
      case 'Shift': {
        if (this.isTrackingPaused) {
          this.isTrackingPaused = false;
          this.inertia = false;
          this.inertiaInitialized = false;
        } else {
          this.isTrackingPaused = true;
          this.inertia = true;
        }
        return;
      }
    }
  };
}
