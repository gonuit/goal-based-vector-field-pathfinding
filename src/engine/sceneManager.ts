import * as PIXI from "pixi.js";

import { Scene } from "./scene";
import { Updater } from "./updater";
import { ParticleScene } from "./particleScene";
import { Point } from "../objects/point";

export interface SceneManagerConfig {}

export class SceneManager {
  private _scenes: Array<Scene | ParticleScene>;
  private _currentScene: Scene | ParticleScene | undefined;
  private _updater: Updater;
  private _renderer: PIXI.Renderer;
  constructor(
    renderer: PIXI.Renderer,
    config?: SceneManagerConfig
  ) {
    this._renderer = renderer;
    this._scenes = [];
    this._currentScene = undefined;
    this._updater = new Updater();
  }

  public addScene = (scene: Scene | ParticleScene) => {
    this._scenes.push(scene);
  };

  public start = (sceneName: string) => {
    const targetScene: Scene | ParticleScene = this._scenes.find(
      (scene: Scene | ParticleScene) => scene.name === sceneName
    );
    if (!targetScene)
      throw new Error(`Scene: "${sceneName}", does not exist in SceneManager`);
    this.switchScene(targetScene);
  };

  private switchScene = (targetScene: Scene | ParticleScene) => {
    if (this._currentScene) this.unmountScene(this._currentScene);
    this.initScene(targetScene);
    this._currentScene = targetScene;
  };

  private initScene = async (scene: Scene | ParticleScene) => {
    await scene.preload();
    scene.init();
    scene.create();
    this._updater.set(this.render);
  };

  private render = () => {
    this._currentScene.update();
    this._renderer.render(this._currentScene);
  };

  private unmountScene = (scene: Scene | ParticleScene) => {
    this._updater.stop();
    scene.unmount();
  };

  private destroyScene = (scene: Scene | ParticleScene) => {
    scene.destroy();
  };
}
