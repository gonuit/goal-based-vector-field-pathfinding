import * as PIXI from 'pixi.js';
import { Scene } from './engine/scene';
import { MainScene } from './scenes/mainScene';
import { SceneManager } from './engine/sceneManager';
import { RendererOptions } from 'pixi.js';
import { TileMap } from './engine/tileMap';
import { DEFAULT_MAP } from './maps/defaultMap';

const config: PIXI.RendererOptions = {
  antialias: true,
  powerPreference: 'high-performance',
  transparent: true,
  width: 840,
  height: 840,
};

export class Game {
  private _renderer: PIXI.Renderer;
  private _sceneManager: SceneManager;
  constructor(config: RendererOptions) {
    this._renderer = PIXI.autoDetectRenderer(config) as any;
    document.getElementById('game').appendChild((this._renderer as any).view);
    this._sceneManager = new SceneManager(this._renderer);
    this.initScene();
  }

  initScene = () => {
    const sceneName: string = 'MAIN';
    const scene: Scene = new MainScene({
      name: sceneName,
      tileMap: new TileMap({
        horizontalBoxes: 21,
        verticalBoxes: 21,
        map: DEFAULT_MAP,
      }),
    });
    this._sceneManager.addScene(scene);
    this._sceneManager.start(sceneName);
  };
}

window.addEventListener('load', () => {
  const game = new Game(config);
});
