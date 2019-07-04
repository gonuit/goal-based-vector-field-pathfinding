import { Scene } from "./scene";

export class SceneManager {
  private _scenes: Array<Scene>;
  private _currentScene: Scene | undefined;
  constructor() {
    this._scenes = [];
    this._currentScene = undefined;
  }

  public addScene = (scene: Scene) => {
    this._scenes.push(scene);
  };

  public start = (sceneName: string) => {
    const targetScene: Scene = this._scenes.find(
      (scene: Scene) => scene.name === sceneName
    );
    if (!targetScene)
      throw new Error(`Scene: "${sceneName}", does not exist in SceneManager`);
    this.switchScene(targetScene);
  };

  private switchScene = (targetScene: Scene) => {
    if (this._currentScene) this.unmountScene(this._currentScene);
    this.initScene(targetScene);
    this._currentScene = targetScene;
  };

  private initScene = (scene: Scene) => {
    scene.preload();
    scene.init();
    scene.create();
  };

  private unmountScene = (scene: Scene) => {
    scene.unmount();
  };

  private destroyScene = (scene: Scene) => {
    scene.destroy();
  };
}
