import * as PIXI from "pixi.js";
import { Point } from "../objects/point";

interface ListenersConfig {
  withMouse: boolean;
}

export interface SceneConfig extends ListenersConfig {
  name: string;
}

export abstract class Scene extends PIXI.Container {
  private _name: string;

  constructor({ name, withMouse = false }: SceneConfig) {
    super();
    this._name = name;
    this._addListeners({ withMouse });
  }

  public get name(): string {
    return this._name;
  }

  protected input = {
    mouse: { position: new Point(0, 0) }
  };

  abstract preload();

  abstract init();

  abstract create();

  abstract update();

  abstract unmount();

  abstract destroy();

  private _handleMousePosition = ({ x, y }: MouseEvent) => {
    console.log("position", x);
    this.input.mouse.position.x = x;
    this.input.mouse.position.y = y;
  };

  private _addListeners = ({ withMouse }: ListenersConfig) => {
    if (withMouse)
      document
        .getElementById("game")
        .addEventListener("mousemove", this._handleMousePosition);
  };
}
