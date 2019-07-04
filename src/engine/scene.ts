import * as PIXI from "pixi.js";
import { Point } from "../objects/point";

interface ListenersConfig {
  withMouse?: boolean;
}

export interface SceneConfig extends ListenersConfig {
  name: string;
}

export class Scene extends PIXI.Container {
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

  public preload = async () => {};

  public init = () => {};

  public create = () => {};

  public update = () => {};

  public unmount = () => {};

  public destroy = () => {};

  private _handleMousePosition = ({ x, y, target }: MouseEvent) => {
    const { left, top } = (target as Element).getBoundingClientRect();
    this.input.mouse.position.x = x - left;
    this.input.mouse.position.y = y - top;
  };

  private _addListeners = ({ withMouse }: ListenersConfig) => {
    if (withMouse)
      document
        .getElementById("game")
        .addEventListener("mousemove", this._handleMousePosition);
  };
}
