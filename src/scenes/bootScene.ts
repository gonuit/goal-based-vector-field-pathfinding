
export class BootScene extends Phaser.Scene {
  constructor() {
    super({
      key: "BootScene"
    });
  }

  preload(): void {
    this.load.bitmapFont(
      "mainFont",
      "./src/assets/font/font.png",
      "./src/assets/font/font.fnt"
    );
  }

  update(): void {
    this.scene.start("GameScene");
  }
}
