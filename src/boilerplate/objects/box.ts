import { Point } from "./point"
import { ForceVector } from "./forceVector"

export interface BoxConfig {
  distance?: number
  visited?: boolean
  position: Point
  forceVector?: ForceVector
  size: number
}

export interface BoxRenderConfig {
  renderDistances?: boolean
  renderVectorLines?: boolean
}

export interface BoxRenderer extends BoxRenderConfig {
  color: number
  alpha?: number
}

export class Box {
  private static FORCE_VECTOR_MULTIPIER: number = 10

  private _distance: number
  private _visited: boolean
  public position: Point
  public graphicsObject: Phaser.GameObjects.Graphics
  public bitmapText: Phaser.GameObjects.BitmapText
  private _gameObjectLineOriginDot: Phaser.GameObjects.Arc
  private _gameObjectLine: Phaser.GameObjects.Line
  private _forceVector: ForceVector
  private _size: number
  constructor({
    distance = 0,
    position,
    visited = false,
    size,
    forceVector = new ForceVector(0, 0), // max value = 1 min = -1
  }: BoxConfig) {
    this._size = size
    this._forceVector = forceVector
    this._distance = distance
    this._visited = visited
    this.position = position
  }

  public set distance(value: number) {
    this._distance = value
    if (this.bitmapText) {
      this.bitmapText.text = value.toString()
    }
  }
  public get distance(): number {
    return this._distance
  }

  public set visited(value: boolean) {
    this._visited = value
  }

  public get visited(): boolean {
    return this._visited
  }

  public get forceVector(): ForceVector {
    return this._forceVector
  }

  public set forceVector(value: ForceVector) {
    this._forceVector = value
  }

  public reset() {
    this._visited = false
    this._distance = 0
    if (this.graphicsObject) {
      this.graphicsObject.destroy()
      this.graphicsObject = undefined
    }
    if (this.bitmapText) {
      this.bitmapText.destroy()
      this.bitmapText = undefined
    }
    this.resetForce()
  }

  public resetForce() {
    this._forceVector.x = 0
    this._forceVector.y = 0
  }

  public removeGraphicObject = () => {
    this.graphicsObject.destroy()
    this.graphicsObject = undefined
  }

  private removeBitmap = () => {
    this.bitmapText.destroy()
    this.bitmapText = undefined
  }

  public render = (factory: Phaser.GameObjects.GameObjectFactory, config: BoxRenderer): Box => {
    this.renderBoxBackground(factory, config)
      .renderVectorLine(factory, config)
      .renderDistances(factory, config)
    return this
  }

  private renderBoxBackground(factory: Phaser.GameObjects.GameObjectFactory, { color, alpha = 1 }: BoxRenderer): Box {
    if (this.graphicsObject) {
      this.graphicsObject.fillStyle(color)
    } else {
      const boxXposition = -this._size + this.position.x * this._size
      const boxYposition = -this._size + this.position.y * this._size
      this.graphicsObject = factory
        .graphics({
          x: boxXposition,
          y: boxYposition,
          fillStyle: {
            color,
            alpha,
          },
        })
        .fillRect(this._size, this._size, this._size, this._size)
    }
    return this
  }

  private renderDistances(factory: Phaser.GameObjects.GameObjectFactory, { renderDistances }: BoxRenderer) {
    if (!renderDistances) {
      if(this.bitmapText) this.removeBitmap()
      return this
    }
    if (!this.bitmapText) {
      const centerAlign = this._size * 1.33
      this.bitmapText = factory.bitmapText(
        this.graphicsObject.x + centerAlign,
        this.graphicsObject.y + centerAlign,
        "mainFont",
        this.distance.toString(),
        8
      )
    } else {
      this.bitmapText.setText(this.distance.toString())
    }
    return this
  }

  private renderVectorLine = (
    factory: Phaser.GameObjects.GameObjectFactory,
    { renderVectorLines }: BoxRenderer
  ): Box => {
    if (!renderVectorLines || !this.graphicsObject) {
      if (this._gameObjectLine) {
        this._gameObjectLine.destroy()
        this._gameObjectLine = undefined
      }
      if (this._gameObjectLineOriginDot) {
        this._gameObjectLineOriginDot.destroy()
        this._gameObjectLineOriginDot = undefined
      }
      return this
    }
    if (this._gameObjectLine) {
      this._gameObjectLine.destroy()
      this._gameObjectLine = undefined
    }
    this._gameObjectLine
    const {
      graphicsObject: { x, y },
      forceVector: { x: forceX, y: forceY },
    } = this
    const positionModifier: number = this._size * 1.5
    const originX = x + positionModifier
    const originY = y + positionModifier
    this._gameObjectLine = factory
      .line(originX, originY, 0, 0, forceX * Box.FORCE_VECTOR_MULTIPIER, forceY * Box.FORCE_VECTOR_MULTIPIER, 0xffffff)
      .setOrigin(0, 0)
      .setLineWidth(0.5)
    if (!this._gameObjectLineOriginDot) {
      this._gameObjectLineOriginDot = factory.circle(originX, originY, 2, 0xffffff)
    }
    return this
  }
}
