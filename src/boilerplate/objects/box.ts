export interface Cords {
  x: number;
  y: number;
}

export interface BoxConfig {
  distance?: number;
  position: Cords;
}

export class Box {
  public distance: number;
  public position: Cords;
  public graphicsObject: Phaser.GameObjects.Graphics
  constructor({ distance = 0, position }: BoxConfig) {
    this.distance = distance;
    this.position = position;
  }
}
