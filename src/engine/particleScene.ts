import * as PIXI from "pixi.js";
import { Point } from "../objects/point";

interface ListenersConfig {
  withMouse?: boolean;
}

export interface ParticleSceneConfig extends ListenersConfig {
  name: string;
  maxParticleCount?: number;
  properties?: {
    vertices?: boolean;
    position?: boolean;
    rotation?: boolean;
    uvs?: boolean;
    tint?: boolean;
  };
}

export class ParticleScene extends PIXI.ParticleContainer {
  private _name: string;

  constructor({
    name,
    maxParticleCount,
    properties,
    withMouse = false
  }: ParticleSceneConfig) {
    super(maxParticleCount, properties);
    this._name = name;
    this._addListeners({ withMouse });
  }

  public get name(): string {
    return this._name;
  }

  protected input = {
    mouse: { position: new Point(0, 0) }
  };

  public preload = () => {};

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
    const canvas = document.getElementById("game").firstElementChild;

    if (withMouse)
      canvas.addEventListener("mousemove", this._handleMousePosition);
  };
}
