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
  private _rectangleObject: Phaser.GameObjects.Rectangle | undefined
  private _bitmapText: Phaser.GameObjects.BitmapText | undefined
  private _gameObjectLineOriginDot: Phaser.GameObjects.Arc | undefined
  private _gameObjectLine: Phaser.GameObjects.Line | undefined
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
    if (this._bitmapText) {
      this._bitmapText.text = value.toString()
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
    this.resetForce()
  }

  public resetForce() {
    this._forceVector.x = 0
    this._forceVector.y = 0
  }

  public removeGraphicObject = () => {
    this._rectangleObject.destroy()
    this._rectangleObject = undefined
  }

  private removeBitmapIfExist = (): void => {
    if (!this._bitmapText) return
    this._bitmapText.destroy()
    this._bitmapText = undefined
  }

  private removeGameObjectLineIfExist = (): void => {
    if (!this._gameObjectLine) return
    this._gameObjectLine.destroy()
    this._gameObjectLine = undefined
  }

  private removeGameObjectLineOriginDotIfExist = (): void => {
    if (!this._gameObjectLineOriginDot) return
    this._gameObjectLineOriginDot.destroy()
    this._gameObjectLineOriginDot = undefined
  }

  public render = (factory: Phaser.GameObjects.GameObjectFactory, config: BoxRenderer): Box => {
    this.renderBoxBackground(factory, config)
      .renderVectorLine(factory, config)
      .renderDistances(factory, config)
    return this
  }

  private renderBoxBackground(factory: Phaser.GameObjects.GameObjectFactory, { color, alpha = 1 }: BoxRenderer): Box {
    if (this._rectangleObject) {
      // this._rectangleObject.destroy()
      // this._rectangleObject = undefined
      this._rectangleObject.fillColor = color
    } else {
      const boxXposition = this._size / 2 + this.position.x * this._size
      const boxYposition = -(this._size / 2) + this.position.y * this._size
      // if(boxXposition != 0) return this
      // if(boxYposition != 0) return this
      this._rectangleObject = factory.rectangle(boxXposition, boxYposition, this._size, this._size, color, alpha)
      // .fillRect(this._size, this._size, this._size, this._size)
    }
    return this
  }

  private renderDistances(factory: Phaser.GameObjects.GameObjectFactory, { renderDistances }: BoxRenderer) {
    if (!renderDistances) {
      this.removeBitmapIfExist()
      return this
    }
    if (!this._bitmapText) {
      this._bitmapText = factory.bitmapText(
        this._rectangleObject.x,
        this._rectangleObject.y,
        "mainFont",
        this.distance.toString(),
        8
      )
    } else {
      this._bitmapText.setText(this.distance.toString())
    }
    return this
  }

  private renderVectorLine = (
    factory: Phaser.GameObjects.GameObjectFactory,
    { renderVectorLines }: BoxRenderer
  ): Box => {
    if (!renderVectorLines || !this._rectangleObject) {
      this.removeGameObjectLineIfExist()
      this.removeGameObjectLineOriginDotIfExist()
      return this
    }

    const { x: forceX, y: forceY } = this.forceVector

    if (this._gameObjectLine) {
      this._gameObjectLine.setTo(0, 0, forceX * Box.FORCE_VECTOR_MULTIPIER, forceY * Box.FORCE_VECTOR_MULTIPIER)
      return this
    }
    const { x, y } = this._rectangleObject
    this._gameObjectLine = factory
      .line(x, y, 0, 0, forceX * Box.FORCE_VECTOR_MULTIPIER, forceY * Box.FORCE_VECTOR_MULTIPIER, 0xffffff)
      .setOrigin(0, 0)
      .setDepth(1)
      .setLineWidth(0.5)

    if (!this._gameObjectLineOriginDot)
      this._gameObjectLineOriginDot = factory.circle(x, y, 2, 0xffffff).setDepth(2)

    return this
  }
}
