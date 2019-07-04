import { Scene } from "../engine/scene";

export class Statistics  {
  private _prevTime: number;
  private _minFPS: number;
  private _maxFPS: number;
  private _currentFPS: number;
  private _frameTimeDistance: number;
  private _scene: Scene;
  private _bitmapFPS: PIXI.BitmapText;
  constructor(scene: Scene) {
    this._scene = scene;
    this._prevTime = 0;
    this._frameTimeDistance = 0;
    this._minFPS = Infinity;
    this._maxFPS = -Infinity;
    this._currentFPS = 0;
  }

  public displayFPS(shouldDisplayFPS: boolean): void {
    if (shouldDisplayFPS && this._bitmapFPS) return;
    if (!shouldDisplayFPS && this._bitmapFPS) {
      this._bitmapFPS.destroy();
      this._bitmapFPS = undefined;
    }
    this._bitmapFPS = new PIXI.BitmapText("FPS", {
      font: { name: "font", size: 24 }
    });
  }

  private updateFPSLogger() {
    if (!this._bitmapFPS) return;
    this._bitmapFPS.text = this._currentFPS.toString();
    if (this._currentFPS < 50) this._bitmapFPS.tint = 0xffffff;
    if (this._currentFPS < 35) this._bitmapFPS.tint = 0xffaa88;
    if (this._currentFPS < 27) this._bitmapFPS.tint = 0xff0000;
    else this._bitmapFPS.tint = 0xaaff77;
  }

  private updateFPSStats = (): void => {
    const truncatedFPS = Math.trunc(1000 / this._frameTimeDistance);
    if (Math.abs(this._currentFPS - truncatedFPS) > 2 || truncatedFPS < 30)
      this._currentFPS = truncatedFPS;
    if (this._currentFPS > this._maxFPS) this._maxFPS = this._currentFPS;
    if (this._currentFPS < this._minFPS) this._minFPS = this._currentFPS;
  };

  public update(time: number): void {
    this._frameTimeDistance = time - this._prevTime;
    this._prevTime = time;
    this.updateFPSStats();
    this.updateFPSLogger();
  }

  public logFPS(): void {
    console.log(this._currentFPS);
  }
}
