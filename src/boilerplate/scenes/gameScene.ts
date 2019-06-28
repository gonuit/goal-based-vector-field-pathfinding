import { Snake } from "../objects/snake";
import { CONST } from "../const/const";
import { Board } from "../objects/board";

export class GameScene extends Phaser.Scene {
  // field and game setting
  private fieldSize: number;
  private gameHeight: number;
  private gameWidth: number;
  private boardWidth: number;
  private boardHeight: number;
  private horizontalFields: number;
  private verticalFields: number;
  private tick: number;

  // objects
  private player: Snake;
  private gameBorder: Phaser.GameObjects.Graphics[];

  private fullBoard: Board;
  private validBoard: Board;
  private colisionBoard: Board;

  // texts
  private scoreText: Phaser.GameObjects.BitmapText;

  constructor() {
    super({
      key: "GameScene"
    });
  }

  init(): void {
    this.fieldSize = 40;
    this.gameHeight = this.sys.canvas.height;
    this.gameWidth = this.sys.canvas.width;
    this.boardWidth = this.gameWidth - 2 * this.fieldSize;
    this.boardHeight = this.gameHeight - 2 * this.fieldSize;
    this.horizontalFields = this.boardWidth / this.fieldSize;
    this.verticalFields = this.boardHeight / this.fieldSize;
    this.tick = 0;
  }

  create(): void {
    this.fullBoard = new Board({
      height: this.gameHeight,
      width: this.gameWidth,
      boxSize: this.fieldSize
    });
    // .render(this.add);

    this.colisionBoard = new Board({
      height: this.gameHeight,
      width: this.gameWidth,
      boxSize: this.fieldSize,
      initAll: false,
      positionsToFill: [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 },
        { x: 10, y: 13 }
      ]
    })
      .render(this.add, { color: { r: 255, a: 1, g: 0, b: 0 } });

    this.validBoard = this.fullBoard
      .removeFromBoard(this.colisionBoard)
      .calculateBoxesDistance({ x: 13, y: 0 })
      .reset()
      .calculateBoxesDistance({ x: 13, y: 13 })
      .reset()
      .calculateBoxesDistance({ x: 13, y: 0 })
      .reset()
      .calculateBoxesDistance({ x: 13, y: 13 })
      .render(this.add, { withDistance: true, colorByDistance: true });

    // this.player = new Snake(this);

    // text
    // this.scoreText = this.add.bitmapText(
    //   this.gameWidth / 2,
    //   1,
    //   "snakeFont",
    //   "" + CONST.SCORE,
    //   8
    // );
  }

  update(time): void {
    // if (this.tick === 0) {
    //   this.tick = time;
    // }
    // if (!this.player.isDead()) {
    //   if (time - this.tick > 100) {
    //     this.player.move();
    //     this.checkCollision();
    //     this.tick = time;
    //   }
    //   this.player.handleInput();
    // } else {
    //   this.scene.start("MainMenuScene");
    // }
  }

  private checkCollision(): void {
    // const { x: headX, y: headY } = this.player.getHead();
    // // player vs. apple collision
    // if (headX === this.apple.x && headY === this.apple.y) {
    //   this.player.growSnake(this);
    //   CONST.SCORE++;
    //   this.scoreText.setText("" + CONST.SCORE);
    //   this.apple.newApplePosition(this.rndXPos(), this.rndYPos());
    // }
    // // border vs. snake collision
    // for (const { x, y } of this.gameBorder) {
    //   if (headX === x && headY === y) {
    //     this.player.setDead(true);
    //   }
    // }
    // // snake vs. snake collision
    // this.player.checkSnakeSnakeCollision();
  }

  // private rndXPos(): number {
  //   return (
  //     Phaser.Math.RND.between(1, this.horizontalFields - 1) * this.fieldSize
  //   );
  // }

  // private rndYPos(): number {
  //   return Phaser.Math.RND.between(1, this.verticalFields - 1) * this.fieldSize;
  // }
}
