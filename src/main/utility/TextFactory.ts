import { BLACK } from "./Constants";

interface WordWrapProps {
  /**
   * Width of the text box
   */
  width?: number;
  /**
   * automatically wrap the text
   */
  useAdvancedWrap?: boolean;
}
interface TextFactoryConfig {
  /**
   * Size with `px` appended to end.  Default is '32px'
   */
  fontSize?: string;
  /**
   * Default is"pixel".
   */
  fontFamily?: string;
  /**
   * Hex value for the color of the text.
   */
  fill?: string;

  /**
   * Options around wrapping text objects
   */
  wordWrap?: WordWrapProps;
  align?: "left" | "right" | "center";
}
export class TextFactory {
  constructor(private scene: Phaser.Scene) {}
  createText(
    content: string,
    position: Coords,
    fontSize: string = "32px",
    config?: TextFactoryConfig
  ) {
    return new Phaser.GameObjects.Text(
      this.scene,
      position.x,
      position.y,
      content,
      {
        fontSize,
        fontFamily: "pixel",
        fill: BLACK.hex,
        ...config,
      }
    );
  }
}
