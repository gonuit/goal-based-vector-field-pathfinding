import Stats = require("stats.js");

export class Updater {
  private _stats: Stats;
  constructor() {}
  private _updateFunction: () => void;
  private _started: boolean;
  public set(updateFunction: () => void): void {
    this._updateFunction = updateFunction;
    this._started = true;
    this._stats = new Stats();
    this._stats.showPanel(0);
    document.body.appendChild(this._stats.dom);
    requestAnimationFrame(this.update);
  }

  public pause = () => {
    this._started = false;
  };

  public resume = () => {
    if (!this._updateFunction)
      throw new Error("Updater is not paused, cannot resume");
    requestAnimationFrame(this.update);
  };

  public stop = () => {
    this._started = false;
    this._updateFunction = undefined;
  };

  private update = () => {
    this._stats.begin();
    this._updateFunction();
    this._stats.end();
    if (this._started) requestAnimationFrame(this.update);
  };
}
