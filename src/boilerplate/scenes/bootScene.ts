
export class BootScene extends Phaser.Scene {
  constructor() {
    super({
      key: "BootScene"
    });
  }

  preload(): void {
    this.load.bitmapFont(
      "snakeFont",
      "./src/games/snake/assets/font/snakeFont.png",
      "./src/games/snake/assets/font/snakeFont.fnt"
    );
  }

  update(): void {
    this.scene.start("GameScene");
  }
}
