import { Box } from "../objects/box";
import { Board } from "../objects/board";
import { Particle } from "../objects/particle";
import { Point } from "../objects/point";

// Worker.ts
const ctx: Worker = self as any;

const moveByPath = (board: Board): void => {
  this._particles.forEach((particle: Particle) => {
    const { x, y } = particle;

    const boxUnderParticle: Box = board.getBoxByDimensions(new Point(x, y));
    if (!boxUnderParticle) {
      console.warn(
        "Particle Manager:\n",
        "Bad particle position\n",
        "(Inert motion)"
      );
      particle.moveByVelocity();
      return;
    }
    particle.setVelocity(boxUnderParticle.forceVector);
  });
  this.checkColisions();

  this._particles.forEach((particle: Particle) => {
    if (this._inaccuracy)
      particle.moveWithInaccuracyByVelocity(this._inaccuracy);
    else particle.moveByVelocity();
  });
}

onmessage = function ({ data }) {
  console.log('ina', data)
  ctx.postMessage({ data });
};


// Post data to parent thread


