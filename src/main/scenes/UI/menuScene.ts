import { UserInterface } from "../../components/UI/UserInterface";
import { State } from "../../utility/state/State";
import { UIPanel, PanelContainer } from '../../components/UI/PanelContainer';
import { Item, ItemCategory } from "../../components/entities/Item";
import { KeyboardControl } from "../../components/UI/Keyboard";
import { PartyMenuConfig, PartyMenuTypes } from "./UIDataTypes";
import { TextFactory } from '../../utility/TextFactory';
import { WarpUtility } from "../../utility/exploration/Warp";
import { ItemPanel, ConfirmItemPanel } from "../../components/menu/ItemPanel";
import { MainPanel } from "../../components/menu/MainMenuPanel";
import { ShopPanel } from "../../components/menu/shop/ShopPanel";


export class MenuScene extends Phaser.Scene {
  private UI: UserInterface;
  private callingSceneKey: string;
  private state: State = State.getInstance();
  private mainPanel: UIPanel;
  private itemPanel: ItemPanel;
  private shopPanel: ShopPanel;
  private debugPanel: UIPanel;
  private keyItemPanel: ItemPanel;
  private coinPanel: PanelContainer;
  private itemConfirmPanel: ConfirmItemPanel;
  constructor() {
    super({ key: "MenuScene" });
  }

  init(data) {
    this.input.keyboard.resetKeys();

    this.callingSceneKey = data.callingSceneKey;
    this.UI = new UserInterface(
      this,
      "dialog-white",
      new KeyboardControl(this)
    );
    // DEBUG
    this.state.addItemToContents(20)

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
    )

    mainPanel.on("store-selected", () =>
      this.startStoreScene()
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
    const itemPanel = new ItemPanel(
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
    const keyItemPanel = new ItemPanel(
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
    const itemConfirmPanel = new ConfirmItemPanel(
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
      .addOption("Start Battle", () => {
        this.input.keyboard.resetKeys();
        this.scene.manager.sleep(this.scene.key);
        this.scene.run('Battle', { key: this.scene.key, enemyPartyId: 6, bossBattle: false })
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

  private startStoreScene() {
    const storeScene = this.scene.get("StoreScene");
    const scenePlugin = new Phaser.Scenes.ScenePlugin(storeScene);
    scenePlugin.bringToTop("StoreScene");
    scenePlugin.setActive(false, "MenuScene");
    scenePlugin.start("StoreScene", {
      callingSceneKey: "MenuScene"
    });
  }

  private closeMenuScene() {
    this.sound.play("menu-close", { volume: 0.1 })
    this.scene.setActive(true, this.callingSceneKey);
    this.scene.stop();
  }

  private setKeyboardEventListeners() {
    this.input.keyboard.on("keyup-Z", event => {
      this.UI.events.off('menu-select')
      this.UI.events.off('menu-traverse')
      this.closeMenuScene();
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



