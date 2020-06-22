import { UserInterface } from "./../components/UI/UserInterface";
import { KeyboardControl } from "../components/UI/Keyboard";
import { ShopPanel } from "../components/shop/ShopPanel";
import { UIPanel } from "../components/UI/UIPanel";
import { ConfirmItemPanel } from "../components/menu/ItemPanel";
import { Item } from "../components/entities/Items/Item";
import { MenuScene } from "./UI/menuScene";
import { ItemController } from "../data/controllers/ItemController";
import { PanelContainer } from "../components/UI/PanelContainer";
import { ShopItemPanel } from "../components/shop/ShopItemPanel";
import { State } from "../utility/state/State";
import { displayMessage } from "./dialogScene";

export class ShopScene extends MenuScene {
  protected shopPanel: ShopPanel;
  protected UI: UserInterface;
  protected callingSceneKey: string;
  protected buyPanel: ShopItemPanel;
  protected sellPanel: ShopItemPanel;
  protected confirmPanel: ConfirmItemPanel;
  private itemController: ItemController;
  private inventoryId: number;
  constructor() {
    super({
      key: "ShopScene",
    });
  }

  init(data) {

    const sm = State.getInstance();
    sm.addItemToContents(19)
    sm.addItemToContents(20)
    sm.addItemToContents(21)
    this.inventoryId = data.inventoryId;
    this.itemController = new ItemController(this.game);
    this.input.keyboard.resetKeys();

    this.callingSceneKey = data.callingSceneKey;

    this.UI = new UserInterface(this, "dialog-blue", new KeyboardControl(this));

    this.shopPanel = this.createAndSetUpShopPanel();

    this.buyPanel = this.createAndSetUpBuyPanel();
    this.sellPanel = this.createAndSetUpSellPanel();
    this.shopPanel.on("buy-selected", () => {
      this.UI.showPanel(this.buyPanel).focusPanel(this.buyPanel);
    });

    this.shopPanel.on("sell-selected", () => {
      this.UI.showPanel(this.sellPanel).focusPanel(this.sellPanel);
      this.sellPanel.refreshPanel()
    });

    this.shopPanel.on("close-selected", () => {
      this.scene.setActive(true, this.callingSceneKey);
      this.scene.stop();
    });
    this.createCoinPanel();

    this.setEventListeners();

    this.UI.showPanel(this.shopPanel).focusPanel(this.shopPanel);
    this.sound.play("menu-open", { volume: 0.1 });
  }

  private createAndSetUpShopPanel() {
    const shopPanel = new ShopPanel(
      { x: 4, y: 3 },
      { x: 0, y: 0 },
      "dialog-blue",
      this
    );
    shopPanel.setUp();
    this.UI.addPanel(shopPanel);

    return shopPanel;
  }

  private createAndSetUpBuyPanel() {
    const shopInventory = this.itemController.getShopInventory(
      this.inventoryId
    );
    const buyPanel = new ShopItemPanel(
      { x: 6, y: 6 },
      { x: 4, y: 0 },
      "dialog-blue",
      this,
      shopInventory.inventory,
      null
    );
    this.UI.addPanel(buyPanel);

    buyPanel.on("item-selected", (item: Item) => {
      this.purchaseItem(item);
    });

    buyPanel.on("item-focused", (item: Item) => {
      buyPanel.updateDisplay(item);
    });

    const itemDetailPanel = new PanelContainer(
      { x: 6, y: 3 },
      { x: 4, y: 6 },
      "dialog-blue",
      this
    );
    buyPanel.addChildPanel("item-detail", itemDetailPanel);
    buyPanel.on("panel-close", () => {
      this.UI.closePanel(buyPanel);
    });

    return buyPanel;
  }
  private createAndSetUpSellPanel() {
    const sm = State.getInstance();
    const items = sm.getItemsOnPlayer();
    const buyPanel = new ShopItemPanel(
      { x: 6, y: 6 },
      { x: 4, y: 0 },
      "dialog-blue",
      this,
      items,
      null
    );
    this.UI.addPanel(buyPanel);

    buyPanel.on("item-selected", (item: Item) => {
      this.sellItem(item);
    });

    buyPanel.on("item-focused", (item: Item) => {
      buyPanel.updateDisplay(item);
    });

    const itemDetailPanel = new PanelContainer(
      { x: 6, y: 3 },
      { x: 4, y: 6 },
      "dialog-blue",
      this
    );
    buyPanel.addChildPanel("item-detail", itemDetailPanel);
    buyPanel.on("panel-close", () => {
      this.UI.closePanel(buyPanel);
    });

    return buyPanel;
  }
  private async purchaseItem(item: Item) {
    const sm = State.getInstance();
    const currentCoins = sm.playerContents.getCoins();
    if (item.value > currentCoins) {
      await displayMessage(["Not enough coins!"], this.game, this.scene);
      return;
    }
    sm.playerContents.removeCoins(item.value);
    sm.playerContents.addItemToContents(item);
    this.coinPanel.updateCoins(sm.playerContents.getCoins());
  }

  private async sellItem(item: Item) {
    const sm = State.getInstance();
    const itemsOnPlayer = sm.getItemsOnPlayer();
    const currentCoins = sm.playerContents.getCoins();
    if (!sm.playerHasItem(item.id)) {
      await displayMessage([`No ${item.name} to sell!`], this.game, this.scene);
      return;
    }
    sm.playerContents.addCoins(item.value);
    sm.playerContents.removeItemFromContents(item);
    this.sellPanel.rebuild(sm.playerContents.getItemsOnPlayer());
    this.coinPanel.updateCoins(sm.playerContents.getCoins());
  }
}
