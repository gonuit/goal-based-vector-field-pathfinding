import { Box } from "./box";

export class Utils {
  public static getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  public static unique = (array: Array<Box>) =>
    array.filter(
      ({ position: { x, y }}, index) =>
        index ===
        array.findIndex(( { position: { x:targetX, y: targetY } } ) => {
          return x === targetX && y === targetY;
        })
    );
}
