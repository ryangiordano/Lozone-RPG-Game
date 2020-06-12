import { PanelContainer } from "../../../../components/UI/PanelContainer";

export class MessagePanel extends PanelContainer {
  protected currentText: Phaser.GameObjects.Text;
  constructor(public scene, dimensions: Coords, position: Coords) {
    super(dimensions, position, "dialog-white", scene);
    this.show();
    this.clearPanelContainerByType("Text");
  }
  /**
   * Function that results after the message scene is done doing its thing.
   * @param message
   */
  public displayMessage(message: string, size: number = 32) {
    this.currentText && this.clearPanelContainerByType("Text");
    this.currentText = this.scene.add.text(
      this.panel.x + 20,
      this.panel.y + 20,
      message,
      {
        fontFamily: "pixel",
        fontSize: `${size}px`,
        fill: "#000000",
        wordWrap: {
          width: (this.panel.width / 4.5) * 4,
          useAdvancedWrap: true,
        },
      }
    );
    this.add(this.currentText);
    this.currentText.setScrollFactor(0);
  }
}
