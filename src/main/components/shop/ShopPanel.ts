import { UIPanel } from "../UI/UIPanel";
export class ShopPanel extends UIPanel {
  constructor(dimensions, pos, spriteKey, scene) {
    super(dimensions, pos, spriteKey, scene);
  }
  setUp() {
    this.addOption("Buy", () => {
      this.emit("buy-selected");
    })
      .addOption("Sell", () => {
        this.emit("sell-selected");
      })
      .addOption("Cancel", () => {
        this.emit("cancel-selected");
      });
  }
}
