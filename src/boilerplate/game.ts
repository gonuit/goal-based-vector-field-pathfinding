import "phaser";
import { BootScene } from "./scenes/bootScene";
import { GameScene } from "./scenes/gameScene";

const config: GameConfig = {
  title: "Goal-Based Vector Field Pathfinding",
  url: "https://github.com/digitsensitive/phaser3-typescript",
  version: "0.8",
  type: Phaser.AUTO,
  parent: "game",
  scene: [BootScene, GameScene],
  input: {
    keyboard: true,
    mouse: true,
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
  const game = new Game({...config, width: 840, height: 840 });
});
