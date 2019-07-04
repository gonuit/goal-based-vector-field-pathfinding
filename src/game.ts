import * as PIXI from "pixi.js";
import { GameScene } from "./scenes/gameScene";
import { Scene } from "./engine/scene";

const config: PIXI.RendererOptions = {
  antialias: true,
  powerPreference: "high-performance",
  width: 840,
  height: 840
};

export class Game {
  // private _isWebGL: boolean;
  private _renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
  private _scene: Scene;
  constructor(config: PIXI.RendererOptions) {
    this._renderer = PIXI.autoDetectRenderer(config);
    // this._isWebGL = this._renderer instanceof PIXI.WebGLRenderer ? true : false;
    document.getElementById("game").appendChild((this._renderer as any).view);
    this.initScene();
  }

  initScene = () => {
    this._scene = new Scene();
    requestAnimationFrame(this._scene.update);
  };
}

window.addEventListener("load", () => {
  const game = new Game(config);
});
