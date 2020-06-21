import { UserInterface } from "./../components/UI/UserInterface";
import { KeyboardControl } from "../components/UI/Keyboard";
import { ShopPanel } from "../components/shop/ShopPanel";
export class ShopScene extends Phaser.Scene {
  private shopPanel: ShopPanel;
  private UI: UserInterface;
  private callingSceneKey: string;

  constructor() {
    super({
      key: "ShopScene",
    });
  }

  init(data) {
    this.input.keyboard.resetKeys();

    this.callingSceneKey = data.callingSceneKey;

    this.UI = new UserInterface(this, "dialog-blue", new KeyboardControl(this));

    this.shopPanel = this.createAndSetUpShopPanel();

    this.shopPanel.on("buy-selected", () => {});

    this.shopPanel.on("sell-selected", () => {});

    this.shopPanel.on("close-selected", () => {
      this.scene.setActive(true, this.callingSceneKey);
      this.scene.stop();
    });
  }

  private createAndSetUpShopPanel() {
    const shopPanel = new ShopPanel(
      { x: 4, y: 3 },
      { x: 0, y: 0 },
      "dialog-white",
      this
    );
    shopPanel.setUp();
    this.UI.addPanel(shopPanel);

    return shopPanel;
  }

  private createAndSetUpSellPanel() {}
}
