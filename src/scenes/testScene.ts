import * as PIXI from "pixi.js";
import { ParticleScene } from "../engine/particleScene";
import { Scene, SceneConfig } from "../engine/scene";

interface Scecon extends Scene {}

export class MainScene extends ParticleScene {
  private static MAX_PARTICLES_COUNT: number = 20000;
  constructor({ name }: SceneConfig) {
    super({ name, maxParticleCount: MainScene.MAX_PARTICLES_COUNT });
  }

  init = () => {};

  preload = () => {};

  create = () => {
    console.log("create");
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xff3300);
    graphics.drawRect(50, 250, 100, 100);
    graphics.endFill();
    const sprite = PIXI.Sprite.from("../assets/image/particle.png");
    const sprite2 = new PIXI.Sprite(PIXI.Texture.WHITE);

    this.addChild(sprite);
    this.addChild(sprite2);
  };

  update = () => {
    console.log("HELLO MAIN SCENE");
  };

  unmount = () => {};

  destroy = () => {};
}
