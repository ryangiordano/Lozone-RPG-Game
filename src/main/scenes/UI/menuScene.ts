import { UserInterface } from "../../components/UI/UserInterface";
import { State } from "../../utility/state/State";
import { UIPanel, PanelContainer } from '../../components/UI/PanelContainer';
import { Item, ItemCategory } from "../../components/entities/Item";
import { KeyboardControl } from "../../components/UI/Keyboard";
import { PartyMenuConfig, PartyMenuTypes } from "./UIDataTypes";
import { TextFactory } from '../../utility/TextFactory';
import { WarpUtility } from "../../utility/exploration/Warp";
import { wait } from "../../utility/Utility";


export class MenuScene extends Phaser.Scene {
  private UI: UserInterface;
  private callingSceneKey: string;
  private state: State = State.getInstance();
  private mainPanel: UIPanel;
  private itemPanel: ItemPanelContainer;
  private debugPanel: UIPanel;
  private keyItemPanel: ItemPanelContainer;
  private coinPanel: PanelContainer;
  private itemConfirmPanel: ConfirmItemPanelContainer;
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
    // DEBUG
    this.state.addItemToContents(1)

    this.mainPanel = this.createAndSetUpMainPanel();

    this.itemPanel = this.createItemPanel();
    this.itemConfirmPanel = this.createItemConfirmPanel();
    this.setUpItemPanels();

    this.keyItemPanel = this.createKeyItemPanel();

    this.debugPanel = this.createDebugPanel();

    this.createCoinPanel();

    this.setEventListeners();

    this.UI.showPanel(this.mainPanel).focusPanel(this.mainPanel);
    this.sound.play("menu-open", { volume: 0.1 })
  }


  // ===================================
  // Main Panel
  // ===================================
  private createAndSetUpMainPanel() {
    const mainPanel = new MainPanel(
      { x: 4, y: 5 }, { x: 0, y: 0 },
      "dialog-white",
      this
    );
    mainPanel.setUp();
    this.UI.addPanel(mainPanel);
    mainPanel.on("items-selected", () => {
      this.itemPanel.refreshPanel();
      this.UI.showPanel(this.itemPanel).focusPanel(this.itemPanel);
    }
    );

    mainPanel.on("key-items-selected", () => {
      this.keyItemPanel.refreshPanel();
      this.UI.showPanel(this.keyItemPanel).focusPanel(this.keyItemPanel);
    }
    );

    mainPanel.on("party-selected", () =>
      this.startPartyMenuScene({ type: PartyMenuTypes.statusCheck, entity: null })
    );

    mainPanel.on("debug-selected", () =>
      this.UI.showPanel(this.debugPanel).focusPanel(this.debugPanel)
    );

    mainPanel.on('cancel-selected', () => this.closeMenuScene())

    return mainPanel;
  }


  // ===================================
  // Item Panels
  // ===================================
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


  private setUpItemPanels() {
    this.itemPanel.on("show-and-focus-confirm-panel", item => {
      this.UI.showPanel(this.itemConfirmPanel);

      this.UI.focusPanel(this.itemConfirmPanel);

      this.itemConfirmPanel.setPanelData(item);
    });

    this.itemConfirmPanel.on("refresh-items", () => this.itemPanel.refreshPanel());

    this.itemConfirmPanel.on("use-item", (item) => {
      this.UI.closePanel(this.itemConfirmPanel)
      this.UI.closePanel(this.itemPanel)
      // Reset the cursor
      // open the party panel
      this.openPartyPanel(item);
    });

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

  // ===================================
  // Coin Panel
  // ===================================
  private createCoinPanel() {
    this.coinPanel = new PanelContainer(
      { x: 4, y: 1 },
      { x: 0, y: 8 },
      'dialog-white',
      this);
    this.coinPanel.show();
    const coin = this.add.sprite(25, 32, 'coin');
    this.coinPanel.add(coin);
    this.anims.create({ key: 'spin', frames: this.anims.generateFrameNumbers('coin', { frames: [0, 1, 2, 1] }), frameRate: 10, repeat: -1, })
    const th = new TextFactory(this);
    const coinAmount = th.createText(State.getInstance().playerContents.getCoins().toString(), { x: 50, y: 10 });
    this.coinPanel.add(coinAmount)
    coin.anims.play('spin');

  }

  // ===================================
  // Debug Panel
  // ===================================
  private createDebugPanel() {
    const dungeonPanel = this.UI.createUIPanel({ x: 6, y: 9 }, { x: 4, y: 0 })
      .addOption("Dungeon One", () => {
        this.scene.stop(this.callingSceneKey);
        const wp = new WarpUtility(this);
        wp.warpTo(6);
      })
      .addOption("Dungeon Two", () => {
        this.scene.stop(this.callingSceneKey);
        const wp = new WarpUtility(this);
        wp.warpTo(10);
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

    this.UI.initialize();
    this.UI.events.on('menu-traverse', () => this.sound.play("menu-tick", { volume: 0.1 }));
    this.UI.events.on('menu-select', () => this.sound.play("menu-select", { volume: 0.1 }));
    this.setKeyboardEventListeners();

    this.events.once("close", () => {
      this.closeMenuScene()
    });
  }

  private openPartyPanel(item) {
    this.startPartyMenuScene({ type: PartyMenuTypes.itemUse, entity: item })
  }

  private closeMenuScene() {
    this.sound.play("menu-close", { volume: 0.1 })
    this.scene.setActive(true, this.callingSceneKey);
    this.scene.stop();
  }

  private setKeyboardEventListeners() {
    this.input.keyboard.on("keydown", event => {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.Z) {
        this.UI.events.off('menu-select')
        this.UI.events.off('menu-traverse')
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

class MainPanel extends UIPanel {
  constructor(
    dimensions: Coords,
    pos: Coords,
    spriteKey: string,
    scene: Phaser.Scene,
    id?: string
  ) {
    super(dimensions, pos, spriteKey, scene, true, id);
  }

  setUp() {
    this
      .addOption("Items", () => {
        this.emit("items-selected", PartyMenuTypes.itemUse);
      })
      .addOption("Key Items", () => {
        this.emit("key-items-selected");
      })
      .addOption("Status", () => {
        this.emit("party-selected", PartyMenuTypes.statusCheck);
      })
      .addOption("Debug", () => {
        this.emit("debug-selected");
      })
      .addOption("Cancel", () => this.emit('cancel-selected'));
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
