import "phaser";
import { BootScene } from "./scenes/bootScene";
import { GameScene } from "./scenes/gameScene";

const config: GameConfig = {
  title: "Snake",
  url: "https://github.com/digitsensitive/phaser3-typescript",
  version: "1.1",
  type: Phaser.AUTO,
  parent: "game",
  scene: [BootScene, GameScene],
  input: {
    keyboard: true,
    mouse: false,
    touch: false,
    gamepad: false
  },
  backgroundColor: "#000000",
  render: { pixelArt: false, antialias: true }
};

export class Game extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }
}

window.addEventListener("load", () => {
  const  { offsetHeight: height, offsetWidth: width } = document.getElementById('game')
  console.log(width, height)
  const game = new Game({...config, width, height });
});
