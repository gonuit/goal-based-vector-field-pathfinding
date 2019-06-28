export class Color {
  private static componentToHex = (c: number): string => {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  };
  static rgbToHex = (r: number, g: number, b: number) => {
    return parseInt(
      "" +
        Color.componentToHex(r) +
        Color.componentToHex(g) +
        Color.componentToHex(b),
      16
    );
  };
}
