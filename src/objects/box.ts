import { Point } from "./point";
import { ForceVector } from "./forceVector";
import { ParticleScene } from "../engine/particleScene";

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
  private _rectangleObject: PIXI.Graphics;
  private _bitmapText: PIXI.Graphics;
  private _gameObjectLineOriginDot: PIXI.Graphics;
  private _gameObjectLine: PIXI.Graphics;
  private _forceVector: ForceVector;
  private _size: number;
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
  }

  public set distance(value: number) {
    this._distance = value;
    // if (this._bitmapText) {
    //   this._bitmapText.text = value.toString();
    // }
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

  public render = (scene: ParticleScene, config: BoxRenderer): Box => {
    this
    // .renderBoxBackground(scene, config)
      .renderVectorLine(scene, config)
      // .renderDistances(scene, config);
    return this;
  };

  // private renderBoxBackground(
  //   scene: ParticleScene,
  //   { color, alpha = 1 }: BoxRenderer
  // ): Box {
  //   if (this._rectangleObject) {
  //     this._rectangleObject.fillColor = color;
  //   } else {
  //     const boxXposition = this._size / 2 + this.position.x * this._size;
  //     const boxYposition = this._size / 2 + this.position.y * this._size;
  //     this._rectangleObject = scene.rectangle(
  //       boxXposition,
  //       boxYposition,
  //       this._size,
  //       this._size,
  //       color,
  //       alpha
  //     );
  //   }
  //   return this;
  // }

  // private renderDistances(
  //   scene: ParticleScene,
  //   { renderDistances }: BoxRenderer
  // ) {
  //   if (!renderDistances) {
  //     this.removeBitmapIfExist();
  //     return this;
  //   }
  //   if (!this._bitmapText) {
  //     this._bitmapText = scene.bitmapText(
  //       this._rectangleObject.x,
  //       this._rectangleObject.y,
  //       "mainFont",
  //       this.distance.toString(),
  //       8
  //     );
  //   } else {
  //     this._bitmapText.setText(this.distance.toString());
  //   }
  //   return this;
  // }

  private renderVectorLine = (
    scene: ParticleScene,
    { renderVectorLines }: BoxRenderer
  ): Box => {
    if (!renderVectorLines || !this._rectangleObject) {
      this.removeGameObjectLineIfExist();
      this.removeGameObjectLineOriginDotIfExist();
      return this;
    }

    const { x: forceX, y: forceY } = this.forceVector;

    if (this._gameObjectLine) {
      this._gameObjectLine.lineTo(
        forceX * Box.FORCE_VECTOR_MULTIPIER,
        forceY * Box.FORCE_VECTOR_MULTIPIER
      );
      return this;
    }
    const { x, y } = this._rectangleObject;
    this._gameObjectLine = new PIXI.Graphics();
    scene.addChild(this._gameObjectLine);
    this._gameObjectLine.position.set(200, 200);
    this._gameObjectLine
      .lineStyle(1, 0xffffff)
      .moveTo(0, 0)
      .lineTo(210, 210);
    this._gameObjectLine.zIndex = 1;

    if (!this._gameObjectLineOriginDot)
      this._gameObjectLineOriginDot = new PIXI.Graphics();
    scene.addChild(this._gameObjectLineOriginDot);
    this._gameObjectLineOriginDot.drawCircle(x, y, 2);
    this._gameObjectLineOriginDot.beginFill(0xffffff, 1)
    this._gameObjectLineOriginDot.zIndex = 2
    return this;
  };
}
