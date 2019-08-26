import { UserInterface } from "../../components/UI/UserInterface";
import { State } from "../../utility/state/State";
import { UIPanel, PanelContainer } from '../../components/UI/PanelContainer';
import { Item, ItemCategory } from "../../components/entities/Item";
import { KeyboardControl } from "../../components/UI/Keyboard";
import { PartyMenuConfig, PartyMenuTypes } from "./UIDataTypes";
import { TextFactory } from '../../utility/TextFactory';
import { WarpUtility } from "../../utility/Warp";


export class MenuScene extends Phaser.Scene {
  private UI: UserInterface;
  private callingSceneKey: string;
  private state: State = State.getInstance();
  constructor() {
    super({ key: "MenuScene" });
  }

  init(data) {
    this.callingSceneKey = data.callingSceneKey;
    this.UI = new UserInterface(
      this,
      "dialog-white",
      new KeyboardControl(this)
    );
    this.state.addItemToContents(6)

    // ===================================
    // Main Panel
    // ===================================
    const mainPanel = this.createMainPanel();
    mainPanel.on("items-selected", () => {
      itemPanel.refreshPanel();
      this.UI.showPanel(itemPanel).focusPanel(itemPanel);
    }
    );

    mainPanel.on("key-items-selected", () => {
      keyItemPanel.refreshPanel();
      this.UI.showPanel(keyItemPanel).focusPanel(keyItemPanel);
    }
    );
    mainPanel.on("party-selected", () =>
      this.startPartyMenuScene({ type: PartyMenuTypes.statusCheck, entity: null })
    );
    mainPanel.on("debug-selected", () =>
      this.UI.showPanel(debugPanel).focusPanel(debugPanel)
    );
    this.UI.showPanel(mainPanel).focusPanel(mainPanel);

    // ===================================
    // Item Panel
    // ===================================
    const itemPanel = this.createItemPanel();
    const itemConfirmPanel = this.createItemConfirmPanel();
    itemPanel.on("show-and-focus-confirm-panel", item => {
      this.UI.showPanel(itemConfirmPanel);
      this.UI.focusPanel(itemConfirmPanel);
      itemConfirmPanel.setPanelData(item);
    });

    itemConfirmPanel.on("refresh-items", () => itemPanel.refreshPanel());
    itemConfirmPanel.on("use-item", (item) => {
      this.UI.closePanel(itemPanel)
      // Reset the cursor
      // open the party panel
      this.openPartyPanel(item);
    });

    // ===================================
    // Key Item Panel
    // ===================================
    const keyItemPanel = this.createKeyItemPanel();
    // ===================================
    // Coin panel
    // ===================================
    this.createCoinPanel();

    const debugPanel = this.createDebugPanel();

    this.setEventListeners();
    this.setKeyboardEventListeners();
    this.UI.initialize();
  }

  private openPartyPanel(item) {
    this.startPartyMenuScene({ type: PartyMenuTypes.itemUse, entity: item })
  }

  private closeMenuScene() {
    this.scene.setActive(true, this.callingSceneKey);
    this.scene.stop();
  }

  private createMainPanel() {
    const mainPanel = this.UI.createUIPanel({ x: 4, y: 5 }, { x: 0, y: 0 });
    mainPanel
      .addOption("Items", () => {
        mainPanel.emit("items-selected", PartyMenuTypes.itemUse);
      })
      .addOption("Key Items", () => {
        mainPanel.emit("key-items-selected");
      })
      .addOption("Status", () => {
        mainPanel.emit("party-selected", PartyMenuTypes.statusCheck);
      })
      .addOption("Debug", () => {
        mainPanel.emit("debug-selected");
      })
      .addOption("Cancel", () => this.closeMenuScene());
    return mainPanel;
  }

  private createItemPanel() {
    const itemPanel = new ItemPanelContainer(
      { x: 6, y: 6 },
      { x: 4, y: 0 },
      "dialog-white",
      this,
      this.state.getItemsOnPlayer(),
      ItemCategory.consumable
    );

    this.UI.addPanel(itemPanel);

    itemPanel.on("item-selected", item => {
      itemPanel.emit("show-and-focus-confirm-panel", item);
    });

    itemPanel.on("item-focused", item => {
      itemPanel.updateDisplay(item);
    });

    const itemDetailPanel = new PanelContainer(
      { x: 6, y: 3 },
      { x: 4, y: 6 },
      "dialog-white",
      this
    );
    itemPanel.addChildPanel('item-detail', itemDetailPanel);
    itemPanel.on("panel-close", () => {
      this.UI.closePanel(itemPanel);
    });
    return itemPanel;
  }

  private createKeyItemPanel() {
    const keyItemPanel = new ItemPanelContainer(
      { x: 6, y: 6 },
      { x: 4, y: 0 },
      "dialog-white",
      this,
      this.state.getItemsOnPlayer(),
      ItemCategory.keyItem
    );
    const itemDetailPanel = new PanelContainer(
      { x: 6, y: 3 },
      { x: 4, y: 6 },
      "dialog-white",
      this
    );

    keyItemPanel.on("item-focused", item => {
      keyItemPanel.updateDisplay(item);
    });

    keyItemPanel.addChildPanel('item-detail', itemDetailPanel);
    this.UI.addPanel(keyItemPanel);

    keyItemPanel.on("panel-close", () => {
      this.UI.closePanel(keyItemPanel);
    });

    return keyItemPanel;
  }

  private createCoinPanel() {
    const coinPanel = new PanelContainer(
      { x: 4, y: 1 },
      { x: 0, y: 8 },
      'dialog-white',
      this);
    coinPanel.showPanel();
    const coin = this.add.sprite(25, 32, 'coin');
    coinPanel.add(coin);
    this.anims.create({ key: 'spin', frames: this.anims.generateFrameNumbers('coin', { frames: [0, 1, 2, 1] }), frameRate: 10, repeat: -1, })
    const th = new TextFactory(this);
    const coinAmount = th.createText(State.getInstance().playerContents.getCoins().toString(), { x: 50, y: 10 });
    coinPanel.add(coinAmount)
    coin.anims.play('spin');

  }

  private createItemConfirmPanel() {
    // Add item use confirmation panel.
    const itemConfirmPanel = new ConfirmItemPanelContainer(
      { x: 3, y: 3 },
      { x: 7, y: 6 },
      "dialog-white",
      this
    );

    this.UI.addPanel(itemConfirmPanel);
    // Add option for confirmation
    itemConfirmPanel
      .addOption("Use", () => {
        const item = itemConfirmPanel.getPanelData();
        itemConfirmPanel.emit("use-item", item);
        this.UI.closePanel(itemConfirmPanel);
      })
      .addOption("Drop", () => {
        const item = itemConfirmPanel.getPanelData();
        this.state.removeItemFromContents(item.id);
        itemConfirmPanel.emit("refresh-items");

        this.UI.closePanel(itemConfirmPanel);
      })
      .addOption("Cancel", () => {
        this.UI.closePanel(itemConfirmPanel);
      });
    return itemConfirmPanel;
  }

  private createDebugPanel() {
    const dungeonPanel = this.UI.createUIPanel({ x: 6, y: 9 }, { x: 4, y: 0 })
      .addOption("Dungeon One", () => {
        this.scene.stop(this.callingSceneKey);
        const wp = new WarpUtility(this);
        wp.warpTo(6);
      })
      .addOption("House", () => {
        this.scene.stop(this.callingSceneKey);
        const wp = new WarpUtility(this);
        wp.warpTo(1);
      })
      .addOption("Cancel", () => {
        this.UI.closePanel(dungeonPanel);
      });
    return dungeonPanel;
  }

  private setEventListeners() {
    this.events.once("close", () => this.closeMenuScene());
  }

  private setKeyboardEventListeners() {
    this.input.keyboard.on("keydown", event => {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.Z) {
        this.closeMenuScene();
      }
    });
  }

  private startPartyMenuScene(config: PartyMenuConfig) {
    const partyMenuScene = this.scene.get("PartyMenuScene");
    const scenePlugin = new Phaser.Scenes.ScenePlugin(partyMenuScene);
    scenePlugin.bringToTop("PartyMenuScene");
    scenePlugin.setActive(false, "MenuScene");
    scenePlugin.start("PartyMenuScene", {
      callingSceneKey: "MenuScene",
      config
    });
  }
}

class ConfirmItemPanelContainer extends UIPanel {
  private itemData: Item;
  constructor(
    dimensions: Coords,
    pos: Coords,
    spriteKey: string,
    scene: Phaser.Scene,
    id?: string
  ) {
    super(dimensions, pos, spriteKey, scene, true, id);
  }

  public setPanelData(item: Item) {
    this.itemData = item;
  }

  public getPanelData() {
    return this.itemData;
  }
}

class ItemPanelContainer extends UIPanel {
  constructor(
    dimensions: Coords,
    pos: Coords,
    spriteKey: string,
    scene: Phaser.Scene,
    private items: Item[],
    private itemCategory: ItemCategory
  ) {
    super(dimensions, pos, spriteKey, scene);
    this.addOptionsViaData();
  }

  setPanelData(items: Item[]) {
    this.items = items;
  }

  addOptionsViaData() {
    this.items.forEach(item => {
      const displayItem = item.category == this.itemCategory;
      const consumable = this.itemCategory == ItemCategory.consumable;
      if (displayItem) {
        const quantity = item.quantity > 1 ? `x${item.quantity}` : '';
        this.addOption(`${item.name} ${quantity}`, () => {
          consumable && this.emit("item-selected", item);
        }, () => {
          this.emit("item-focused", item);
        });

      }
    });
    this.addOption("Cancel", () => {
      this.emit("panel-close");
    }, () => {
      this.emit("item-focused", null);
    });
  }

  public updateDisplay(item) {
    const container = this.childPanels.get('item-detail');
    container.clearPanelContainerByTypes(['Text', 'Sprite']);
    if (!item) return;
    const textFactory = new TextFactory(this.scene);
    const { description, frame, spriteKey } = item;
    const textDescription = textFactory.createText(description, { x: 30, y: 90 }, '18px', {
      wordWrap: {
        width: (this.panel.width / 4.5) * 4,
        useAdvancedWrap: true
      }
    })
    const sprite = new Phaser.GameObjects.Sprite(this.scene, 50, 50, spriteKey)
    sprite.setFrame(frame);

    container.add(textDescription);
    container.add(sprite);
  }

  public refreshPanel() {
    this.list = this.list.filter(item => item.type !== "Text");
    this.options = [];
    this.addOptionsViaData();
  }
}
