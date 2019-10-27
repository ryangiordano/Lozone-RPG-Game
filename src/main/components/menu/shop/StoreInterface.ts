import { UIPanel, PanelContainer } from "../../UI/PanelContainer";
import { UserInterface } from "../../UI/UserInterface";
import { KeyboardControl } from "../../UI/Keyboard";

export class StoreInterfaceBuilder {
  private spriteKey = 'dialog-blue';
  constructor(private scene) {
  }
  public create() {

    const mainPanel = this.createMainPanel();
    const purchasePanel = this.createPurchasePanel();
    const sellPanel = this.createSellPanel();
    const buyPanel = this.createBuyPanel();
    const storeMessagePanel = this.createStoreMessagePanel();

    const storeInterface = new UserInterface(this.scene, this.spriteKey, new KeyboardControl(this.scene));
    storeInterface.addPanel(mainPanel);
    storeInterface.addPanel(purchasePanel);
    storeInterface.addPanel(sellPanel);
    storeInterface.addPanel(buyPanel);
    storeInterface.addPanel(storeMessagePanel);

    
    
    
    return storeInterface;
  }

  public createMainPanel() {
    const mainPanel = new UIPanel({ x: 3, y: 3 }, { x: 0, y: 0 }, this.spriteKey, this.scene, true);
    return mainPanel;
  }

  public createPurchasePanel() {
    const purchasePanel = new UIPanel({ x: 6, y: 6 }, { x: 3, y: 0 }, this.spriteKey, this.scene, true);
    return purchasePanel;
  }

  public createSellPanel() {
    const sellPanel = new UIPanel({ x: 6, y: 6 }, { x: 3, y: 0 }, this.spriteKey, this.scene, true);
    return sellPanel;
  }
  public createBuyPanel() {
    const sellPanel = new UIPanel({ x: 6, y: 6 }, { x: 3, y: 0 }, this.spriteKey, this.scene, true);
    return sellPanel;
  }
  public createConfirmPanel() {
    const confirmPanel = new ConfirmAmountPanel({ x: 6, y: 6 }, { x: 3, y: 0 }, this.spriteKey, this.scene, true)
  }


  public createStoreMessagePanel() {
    const sellPanel = new UIPanel({ x: 6, y: 6 }, { x: 3, y: 0 }, this.spriteKey, this.scene, true);
    return sellPanel;
  }


}

export class StoreInterface extends UserInterface {
  constructor(
    scene: Phaser.Scene,
    spriteKey: string,
    panels: any
  ) {
    super(scene, spriteKey);
  }

  private setupKeyboard() {
    this.keyboardControl.on("esc", "party-menu-container", () =>
      this.emit("close-menu")
    );
    this.keyboardControl.on("right", "party-menu-container", () =>
      this.focusNext()
    );
    this.keyboardControl.on("down", "party-menu-container", () =>
      this.focusBelow()
    );
    this.keyboardControl.on("up", "party-menu-container", () =>
      this.focusAbove()
    );
    this.keyboardControl.on("left", "party-menu-container", () =>
      this.focusPrevious()
    );
    this.keyboardControl.on("space", "party-menu-container", () => {
      this.selectPartyMember();
    });
  }
}


class StoreMessagePanel extends PanelContainer {

}


/**
 * Increment or decrement amount.  Escape to close, space to confirm.
 */
class ConfirmAmountPanel extends UIPanel {

}

