import { Box } from "./box"
import { Point } from "./point"

export class Utils {
  public static getRandomInt(min: number, max: number): number {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  public static getRandomFloat = (min: number, max: number): number => Math.random() * (max - min) + min

  public static uniqueBoxArray = (array: Array<Box>) =>
    array.filter(
      ({ position: { x, y } }, index) =>
        index ===
        array.findIndex(({ position: { x: targetX, y: targetY } }) => {
          return x === targetX && y === targetY
        })
    )

  public static uniquePointArray = (array: Array<Point>) =>
    array.filter(
      ({ x, y }, index) =>
        index ===
        array.findIndex(({ x: targetX, y: targetY }) => {
          return x === targetX && y === targetY
        })
    )
}
