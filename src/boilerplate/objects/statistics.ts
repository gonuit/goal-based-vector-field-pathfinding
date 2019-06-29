import { Scene } from "phaser"

export class Statistics {
  private _prevTime: number
  private _minFPS: number
  private _maxFPS: number
  private _currentFPS: number
  private _frameTimeDistance: number
  private _tick: number
  private _scene: Scene
  private _bitmapFPS: Phaser.GameObjects.BitmapText | undefined
  constructor(scene: Scene) {
    this._scene = scene
    this._prevTime = 0
    this._frameTimeDistance = 0
    this._minFPS = Infinity
    this._maxFPS = -Infinity
    this._currentFPS = 0
  }

  public displayFPS(shouldDisplayFPS: boolean): void {
    if (shouldDisplayFPS && this._bitmapFPS) return
    if(!shouldDisplayFPS && this._bitmapFPS) {
      this._bitmapFPS.destroy()
      this._bitmapFPS = undefined
    }
    this._bitmapFPS = this._scene.add.bitmapText(10, 10, "mainFont", this._currentFPS.toString(), 20).setDepth(100).setTintFill(0xff0000)
  }

  private updateFPSLogger() {
    if(!this._bitmapFPS) return
    this._bitmapFPS.text = this._currentFPS.toString()
    if(this._currentFPS < 50) this._bitmapFPS.setTintFill(0xffffff)
    if(this._currentFPS < 35) this._bitmapFPS.setTintFill(0xffaa88) 
    if(this._currentFPS < 27) this._bitmapFPS.setTintFill(0xff0000) 
    else this._bitmapFPS.setTintFill(0xaaff77)
  }

  private updateFPSStats = (): void => {
    this._currentFPS = Math.trunc(1000 / this._frameTimeDistance)
    if (this._currentFPS > this._maxFPS) this._maxFPS = this._currentFPS
    if (this._currentFPS < this._minFPS) this._minFPS = this._currentFPS
  }

  public update(time: number): void {
    this._frameTimeDistance = time - this._prevTime
    this._prevTime = time
    this.updateFPSStats()
    this.updateFPSLogger()
    this._tick++
  }

  public logFPS(): void {
    console.log(this._currentFPS)
  }
}
