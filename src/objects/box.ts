import * as PIXI from "pixi.js";
import { Point } from "./point";
import { ForceVector } from "./forceVector";
import { Scene } from "../engine/scene";

export interface BoxConfig {
  distance?: number;
  visited?: boolean;
  position: Point;
  forceVector?: ForceVector;
  size: number;
}

export interface BoxRenderConfig {
  renderDistances?: boolean;
  renderVectorLines?: boolean;
}

export interface BoxRenderer extends BoxRenderConfig {
  color: number;
  alpha?: number;
}

export class Box {
  private static FORCE_VECTOR_MULTIPIER: number = 10;

  private _distance: number;
  private _visited: boolean;
  public position: Point;
  private _rectangleObject: PIXI.Sprite;
  private _bitmapText: PIXI.BitmapText;
  private _gameObjectLineOriginDot: PIXI.Sprite;
  private _gameObjectLine: PIXI.Graphics;
  private _forceVector: ForceVector;
  private _size: number;
  private _boxCenterPosition: Point;
  constructor({
    distance = 0,
    position,
    visited = false,
    size,
    forceVector = new ForceVector(0, 0) // max value = 1 min = -1
  }: BoxConfig) {
    this._size = size;
    this._forceVector = forceVector;
    this._distance = distance;
    this._visited = visited;
    this.position = position;
    this._boxCenterPosition = new Point(
      this.position.x * this._size + this._size * 0.5,
      this.position.y * this._size + this._size * 0.5
    );
  }

  public set distance(value: number) {
    this._distance = value;
    if (this._bitmapText) {
      this._bitmapText.text = value.toString();
    }
  }
  public get distance(): number {
    return this._distance;
  }

  public set visited(value: boolean) {
    this._visited = value;
  }

  public get visited(): boolean {
    return this._visited;
  }

  public get forceVector(): ForceVector {
    return this._forceVector;
  }

  public set forceVector(value: ForceVector) {
    this._forceVector = value;
  }

  public get rectanglePosition(): Point {
    if (!this._rectangleObject) return undefined;
    return new Point(this._rectangleObject.x, this._rectangleObject.y);
  }

  public get boxCenterPosition(): Point {
    if (!this._boxCenterPosition) return undefined;
    return new Point(this._boxCenterPosition.x, this._boxCenterPosition.y);
  }

  public reset() {
    this._visited = false;
    this._distance = 0;
    this.resetForce();
  }

  public resetForce() {
    this._forceVector.x = 0;
    this._forceVector.y = 0;
  }

  public removeGraphicObject = () => {
    this._rectangleObject.destroy();
    this._rectangleObject = undefined;
  };

  private removeBitmapIfExist = (): void => {
    if (!this._bitmapText) return;
    this._bitmapText.destroy();
    this._bitmapText = undefined;
  };

  private removeGameObjectLineIfExist = (): void => {
    if (!this._gameObjectLine) return;
    this._gameObjectLine.destroy();
    this._gameObjectLine = undefined;
  };

  private removeGameObjectLineOriginDotIfExist = (): void => {
    if (!this._gameObjectLineOriginDot) return;
    this._gameObjectLineOriginDot.destroy();
    this._gameObjectLineOriginDot = undefined;
  };

  public render = (scene: Scene, config: BoxRenderer): Box => {
    this.renderBoxBackground(scene, config)
      .renderVectorLine(scene, config)
      .renderDistances(scene, config);
    return this;
  };

  private renderBoxBackground(
    scene: Scene,
    { color, alpha = 1 }: BoxRenderer
  ): Box {
    if (this._rectangleObject) {
      this._rectangleObject.tint = color;
      this._rectangleObject.alpha = alpha;
    } else {
      const boxXposition = this.position.x * this._size;
      const boxYposition = this.position.y * this._size;
      this._rectangleObject = new PIXI.Sprite(PIXI.Texture.WHITE);
      this._rectangleObject.tint = color;
      this._rectangleObject.alpha = alpha;
      this._rectangleObject.width = this._size;
      this._rectangleObject.height = this._size;
      this._rectangleObject.position.set(boxXposition, boxYposition);
      scene.addChild(this._rectangleObject);
    }
    return this;
  }

  private renderDistances(scene: Scene, { renderDistances }: BoxRenderer) {
    if (!renderDistances) {
      this.removeBitmapIfExist();
      return this;
    }
    if (!this._bitmapText) {
      this._bitmapText = new PIXI.BitmapText(this.distance.toString(), {
        font: {
          name: "font",
          size: 8
        },
        tint: 0xffffff
      });
      const { x, y } = this._boxCenterPosition;
      this._bitmapText.x = x;
      this._bitmapText.y = y;
      scene.addChild(this._bitmapText);
    } else {
      this._bitmapText.text = this.distance.toString();
    }
    return this;
  }

  private renderVectorLine = (
    scene: Scene,
    { renderVectorLines }: BoxRenderer
  ): Box => {
    if (!renderVectorLines) {
      this.removeGameObjectLineIfExist();
      this.removeGameObjectLineOriginDotIfExist();
      return this;
    }

    const { x: forceX, y: forceY } = this.forceVector;
    const { x, y } = this._boxCenterPosition;

    if (this._gameObjectLine) {
      this._gameObjectLine.clear();
      this._gameObjectLine.position.set(x, y);
      this._gameObjectLine
        .lineStyle(1, 0xffffff)
        .moveTo(0, 0)
        .lineTo(
          forceX * Box.FORCE_VECTOR_MULTIPIER,
          forceY * Box.FORCE_VECTOR_MULTIPIER
        );
      return this;
    }

    this._gameObjectLine = new PIXI.Graphics();
    this._gameObjectLine.position.set(x, y);
    this._gameObjectLine
      .lineStyle(1, 0xffffff)
      .moveTo(0, 0)
      .lineTo(
        forceX * Box.FORCE_VECTOR_MULTIPIER,
        forceY * Box.FORCE_VECTOR_MULTIPIER
      );

    scene.addChild(this._gameObjectLine);

    if (!this._gameObjectLineOriginDot) {
      const sprite = PIXI.Sprite.from("../assets/image/particle.png");
      sprite.position.set(x - 1, y);
      sprite.width = 3;
      sprite.height = 3;
      scene.addChild(sprite);
      this._gameObjectLineOriginDot = sprite;
    }
    return this;
  };
}
