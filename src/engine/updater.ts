export class Updater {
  constructor() {}
  private _updateFunction: () => void;
  private _started: boolean;
  public set(updateFunction: () => void): void {
    this._updateFunction = updateFunction;
    this._started = true;
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
    console.log("update");
    this._updateFunction();
    if (this._started) requestAnimationFrame(this.update);
  };
}
