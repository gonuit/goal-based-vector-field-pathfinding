
export class BootScene extends Phaser.Scene {
  constructor() {
    super({
      key: "BootScene"
    });
  }

  preload(): void {
    this.load.bitmapFont(
      "mainFont",
      "./src/boilerplate/assets/font/font.png",
      "./src/boilerplate/assets/font/font.fnt"
    );
  }

  update(): void {
    this.scene.start("GameScene");
  }
}
