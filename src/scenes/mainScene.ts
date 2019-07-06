import * as PIXI from "pixi.js";
import { ParticleScene, ParticleSceneConfig } from "../engine/particleScene";
import { Point } from "../objects/point";
import { Board } from "../objects/board";
import { Statistics } from "../objects/statistics";
import { ParticleThreadsManager } from "../objects/particleThreadsManager";
import { ParticleManager } from "../objects/particleManager";
import { Scene } from "../engine/scene";

interface MainSceneConfig extends ParticleSceneConfig {}

export class MainScene extends Scene {
  private static THREADS_COUNT: number = 2;
  private static PARTICLES_COUNT: number = 10000;
  private static MAX_PARTICLES_COUNT: number = 10000;
  constructor({ name }: MainSceneConfig) {
    super({
      name,

      withMouse: true
    });
    // TODO: Fix this thing
    this.particleScene = new ParticleScene({
      name: "SUB_MAIN",
      maxParticleCount: MainScene.MAX_PARTICLES_COUNT,
      withMouse: false
    });
    this.particleScene.visible = true;
    this.particleScene.zIndex = 1000;
    this.stage = new Scene({ withMouse: false, name: "scene" });
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
    this.horizontalBoxes = 21;
    this.verticalBoxes = 21;
  };

  preload = async () => {
    let options = { crossOrigin: true };
    const loader = new PIXI.Loader();
    loader.add("font", "assets/font/font.fnt", options);
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
      positionsToFill: [
        ...this.initBoardBorders({
          horizontalBoxes: this.horizontalBoxes,
          verticalBoxes: this.verticalBoxes
        }),
        new Point(9, 1),
        new Point(9, 2),
        new Point(9, 3),
        new Point(9, 4),
        new Point(9, 5),
        new Point(9, 6),
        new Point(9, 7),
        new Point(9, 8),
        new Point(9, 9),
        new Point(9, 10),
        new Point(9, 11),
        new Point(9, 12),
        new Point(9, 13),
        new Point(9, 14),
        new Point(9, 15),
        new Point(9, 16),
        new Point(9, 17),

        new Point(13, 3),
        new Point(13, 4),
        new Point(13, 5),
        new Point(13, 6),
        new Point(13, 7),
        new Point(13, 8),
        new Point(13, 9),
        new Point(13, 10),
        new Point(13, 11),
        new Point(13, 12),
        new Point(13, 13),
        new Point(13, 14),
        new Point(13, 15),
        new Point(13, 16),
        new Point(13, 17),
        new Point(13, 18),
        new Point(13, 19),
        new Point(13, 20),

        new Point(16, 3),
        new Point(17, 3),
        new Point(18, 3),
        new Point(19, 3),

        new Point(13, 6),
        new Point(14, 6),
        new Point(15, 6),
        new Point(16, 6)
      ]
    }).render();

    this.validBoard = new Board(this.stage, {
      horizontalBoxes: this.horizontalBoxes,
      verticalBoxes: this.verticalBoxes,
      boxSize: this.fieldSize
    }).removeFromBoard(this.colisionBoard);

    this.validBoard.rendererConfig = {
      color: { r: 0, g: 0, b: 0, a: 1 },
      renderVectorLines: false,
      colorByDistance: false
    };

    this.particleManager = new ParticleManager(this.particleScene, {
      amount: MainScene.PARTICLES_COUNT,
      inaccuracy: { min: 0.5, max: 1 },
      initialPosition: new Point(100, 100),
      colisionBoard: this.colisionBoard,
      particleTexture: PIXI.Texture.from("../../assets/image/particle.png"),
      tint: 0x00ffff,
      alpha: 0.5
    });

    this.particleThreadsManager = new ParticleThreadsManager({
      board: this.validBoard,
      colisionBoard: this.colisionBoard,
      particleManager: this.particleManager,
      numberOfThreads: MainScene.THREADS_COUNT
    });

    this.initText();
  };

  update = () => {
    this.ui;
    if (!this.isTrackingPaused) {
      const { x: mouseX, y: mouseY } = this.input.mouse.position;
      const hoverBoxPosition: Point = this.validBoard.getBoxPositionByDimensions(
        new Point(mouseX, mouseY)
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
      `Threads: ${
        this.isSingleThread ? 1 : MainScene.THREADS_COUNT + 1
      } Particles: ${MainScene.PARTICLES_COUNT}`,
      {
        font: { name: "font", size: 11 },
        tint: 0x000000
      }
    );
    this.helpText = new PIXI.BitmapText(
      `Shift: turn of tracking \nSpace: pause tracking\n1,2,3,4: pathfinding debug view   `,
      {
        font: { name: "font", size: 8 },
        tint: 0x000000
      }
    );
    this.authorText = new PIXI.BitmapText(`Author github id: gonuit`, {
      font: { name: "font", size: 8 },
      tint: 0x000000
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

  private initBoardBorders = ({
    horizontalBoxes,
    verticalBoxes
  }: {
    horizontalBoxes: number;
    verticalBoxes: number;
  }): Array<Point> => {
    const tileMap: Array<Point> = [];
    for (let i = 0; i < horizontalBoxes; i++) {
      tileMap.push(new Point(i, 0));
      tileMap.push(new Point(i, verticalBoxes - 1));
    }
    for (let i = 1; i < verticalBoxes - 1; i++) {
      tileMap.push(new Point(0, i));
      tileMap.push(new Point(horizontalBoxes - 1, i));
    }
    return tileMap;
  };

  private initEvents = () => {
    document.body.addEventListener("keyup", this.handleKeyboardEvent);
  };

  private handleKeyboardEvent = (event: KeyboardEvent) => {
    switch (event.key) {
      case "1": {
        this.validBoard.rendererConfig = {
          ...this.validBoard.rendererConfig,
          colorByDistance: !this.validBoard.rendererConfig.colorByDistance
        };
        return;
      }
      case "2": {
        this.validBoard.rendererConfig = {
          ...this.validBoard.rendererConfig,
          renderDistances: !this.validBoard.rendererConfig.renderDistances,
          renderVectorLines: false
        };
        return;
      }
      case "3": {
        this.validBoard.rendererConfig = {
          ...this.validBoard.rendererConfig,
          renderVectorLines: !this.validBoard.rendererConfig.renderVectorLines,
          renderDistances: false
        };
        return;
      }
      case "4": {
        this.validBoard.rendererConfig = {
          ...this.validBoard.rendererConfig,
          indicateBoardRefresh: !this.validBoard.rendererConfig
            .indicateBoardRefresh
        };
        return;
      }
      case " ": {
        this.isTrackingPaused = !this.isTrackingPaused;
        this.inertia = false;
        return;
      }
      case "Shift": {
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
