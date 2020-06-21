import { UserInterface } from "../../components/UI/UserInterface";
import { State } from "../../utility/state/State";
import { PanelContainer } from "../../components/UI/PanelContainer";
import { ItemCategory } from "../../components/entities/Items/Item";
import { KeyboardControl } from "../../components/UI/Keyboard";
import { TextFactory } from "../../utility/TextFactory";
import { WarpUtility } from "../../utility/exploration/Warp";
import {
  ItemPanel,
  ConfirmItemPanel,
  EquipmentPanel,
} from "../../components/menu/ItemPanel";
import { MainPanel } from "../../components/menu/MainMenuPanel";
import { AudioScene } from "../audioScene";
import { UIPanel } from "../../components/UI/UIPanel";
import { startScene } from "../utility";
import CoinPanel from "../../components/menu/CoinPanel";

export class MenuScene extends Phaser.Scene {
  protected UI: UserInterface;
  protected callingSceneKey: string;
  protected state: State = State.getInstance();
  protected mainPanel: UIPanel;
  protected itemPanel: ItemPanel;
  protected equipmentPanel: ItemPanel;
  protected equipConfirmPanel: ConfirmItemPanel;

  protected debugPanel: UIPanel;
  protected keyItemPanel: ItemPanel;
  protected coinPanel: CoinPanel;
  protected itemConfirmPanel: ConfirmItemPanel;
  constructor(config) {
    super({ key: config ? config.key : "MenuScene" });
  }

  init(data) {
    this.input.keyboard.resetKeys();

    this.callingSceneKey = data.callingSceneKey;

    this.UI = new UserInterface(
      this,
      "dialog-white",
      new KeyboardControl(this)
    );
    this.mainPanel = this.createAndSetUpMainPanel();

    this.itemPanel = this.createItemPanel();
    this.itemConfirmPanel = this.createItemConfrmPanel();
    this.setUpItemPanels();

    this.equipmentPanel = this.createEquipmentPanel();
    this.equipConfirmPanel = this.createEquipConfirmPanel();
    this.setUpEquipmentPanels();

    this.keyItemPanel = this.createKeyItemPanel();

    this.debugPanel = this.createDebugPanel();

    this.createCoinPanel();

    this.setEventListeners();

    this.UI.showPanel(this.mainPanel).focusPanel(this.mainPanel);
    this.sound.play("menu-open", { volume: 0.1 });
  }

  public openEquipmentMenu() {
    this.equipmentPanel.refreshPanel();
    this.UI.showPanel(this.equipmentPanel).focusPanel(this.equipmentPanel);
  }

  public openItemMenu() {
    this.itemPanel.refreshPanel();
    this.UI.showPanel(this.itemPanel).focusPanel(this.itemPanel);
  }

  public openKeyItemMenu() {
    this.keyItemPanel.refreshPanel();
    this.UI.showPanel(this.keyItemPanel).focusPanel(this.keyItemPanel);
  }

  // ===================================
  // Main Panel
  // ===================================
  protected createAndSetUpMainPanel() {
    const mainPanel = new MainPanel(
      { x: 4, y: 4 },
      { x: 0, y: 0 },
      "dialog-white",
      this
    );
    mainPanel.setUp();
    this.UI.addPanel(mainPanel);
    mainPanel.on("items-selected", () => {
      this.openItemMenu();
    });

    mainPanel.on("equipment-selected", () => {
      this.openEquipmentMenu();
    });

    mainPanel.on("key-items-selected", () => {
      this.openKeyItemMenu();
    });

    mainPanel.on("party-selected", () => this.startPartyStatusScene());

    mainPanel.on("magic-selected", () => this.startPartyMagicScene());

    mainPanel.on("debug-selected", () =>
      this.UI.showPanel(this.debugPanel).focusPanel(this.debugPanel)
    );

    mainPanel.on("cancel-selected", () => this.closeMenuScene());

    return mainPanel;
  }

  // ===================================
  // Item Panels
  // ===================================
  protected createItemPanel() {
    const itemPanel = new ItemPanel(
      { x: 6, y: 6 },
      { x: 4, y: 0 },
      "dialog-white",
      this,
      this.state.getItemsOnPlayer(),
      ItemCategory.consumable
    );

    this.UI.addPanel(itemPanel);

    itemPanel.on("item-selected", (item) => {
      itemPanel.emit("show-and-focus-confirm-panel", item);
    });

    itemPanel.on("item-focused", (item) => {
      itemPanel.updateDisplay(item);
    });

    const itemDetailPanel = new PanelContainer(
      { x: 6, y: 3 },
      { x: 4, y: 6 },
      "dialog-white",
      this
    );
    itemPanel.addChildPanel("item-detail", itemDetailPanel);
    itemPanel.on("panel-close", () => {
      this.UI.closePanel(itemPanel);
    });
    return itemPanel;
  }

  protected createEquipmentPanel() {
    const equipmentPanel = new EquipmentPanel(
      { x: 6, y: 6 },
      { x: 4, y: 0 },
      "dialog-white",
      this,
      this.state.getItemsOnPlayer(),
      ItemCategory.equipment
    );

    this.UI.addPanel(equipmentPanel);
    equipmentPanel.on("item-selected", (item) => {
      equipmentPanel.emit("show-and-focus-confirm-panel", item);
    });
    equipmentPanel.on("item-focused", (item) => {
      equipmentPanel.updateDisplay(item);
    });

    const itemDetailPanel = new PanelContainer(
      { x: 6, y: 3 },
      { x: 4, y: 6 },
      "dialog-white",
      this
    );
    equipmentPanel.addChildPanel("item-detail", itemDetailPanel);
    equipmentPanel.on("panel-close", () => {
      this.UI.closePanel(equipmentPanel);
    });
    return equipmentPanel;
  }

  protected createKeyItemPanel() {
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

    keyItemPanel.on("item-focused", (item) => {
      keyItemPanel.updateDisplay(item);
    });

    keyItemPanel.addChildPanel("item-detail", itemDetailPanel);
    this.UI.addPanel(keyItemPanel);

    keyItemPanel.on("panel-close", () => {
      this.UI.closePanel(keyItemPanel);
    });

    return keyItemPanel;
  }

  protected setUpItemPanels() {
    this.itemPanel.on("show-and-focus-confirm-panel", (item) => {
      this.UI.showPanel(this.itemConfirmPanel);

      this.UI.focusPanel(this.itemConfirmPanel);

      this.itemConfirmPanel.setPanelData(item);
    });

    this.itemConfirmPanel.on("refresh-items", () =>
      this.itemPanel.refreshPanel()
    );

    this.itemConfirmPanel.on("use-item", (item) => {
      this.UI.closePanel(this.itemConfirmPanel);
      this.UI.closePanel(this.itemPanel);
      // Reset the cursor
      // open the party panel
      this.startPartyItemScene(item);
    });
  }

  protected setUpEquipmentPanels() {
    this.equipmentPanel.on("show-and-focus-confirm-panel", (item) => {
      this.UI.showPanel(this.equipConfirmPanel);

      this.UI.focusPanel(this.equipConfirmPanel);

      this.equipConfirmPanel.setPanelData(item);
    });

    this.equipConfirmPanel.on("refresh-items", () =>
      this.equipmentPanel.refreshPanel()
    );

    this.equipConfirmPanel.on("equip-item", (item) => {
      this.UI.closePanel(this.equipConfirmPanel);
      this.UI.closePanel(this.equipmentPanel);
      // Reset the cursor
      // open the party panel
      this.startPartyEquipScene(item);
    });
  }

  protected createItemConfrmPanel() {
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

  protected createEquipConfirmPanel() {
    // Add item use confirmation panel.
    const equipConfirmPanel = new ConfirmItemPanel(
      { x: 3, y: 3 },
      { x: 7, y: 6 },
      "dialog-white",
      this
    );

    this.UI.addPanel(equipConfirmPanel);
    // Add option for confirmation
    equipConfirmPanel
      .addOption("Equip", () => {
        const equipment = equipConfirmPanel.getPanelData();
        equipConfirmPanel.emit("equip-item", equipment);
      })
      .addOption("Cancel", () => {
        this.UI.closePanel(equipConfirmPanel);
      });
    return equipConfirmPanel;
  }

  protected startPartyStatusScene() {
    startScene("PartyStatusScene", this);
  }
  protected startPartyMagicScene() {
    startScene("PartySpellCastScene", this, {});
  }
  protected startPartyItemScene(item) {
    startScene("PartyItemUseScene", this, { entity: item });
  }

  protected startPartyEquipScene(item) {
    startScene("PartyEquipScene", this, { entity: item });
  }

  // ===================================
  // Coin Panel
  // ===================================
  protected createCoinPanel() {
    this.coinPanel = new CoinPanel({ x: 0, y: 8 }, this);
    this.coinPanel.init();
  }

  // ===================================
  // Debug Panel
  // ===================================
  protected createDebugPanel() {
    const dungeonPanel = this.UI.createUIPanel({ x: 6, y: 9 }, { x: 4, y: 0 })
      .addOption("Dungeon One", () => {
        this.scene.stop(this.callingSceneKey);
        const wp = new WarpUtility(this);
        wp.warpTo(4);
      })
      .addOption("Dungeon Two", () => {
        this.scene.stop(this.callingSceneKey);
        const wp = new WarpUtility(this);
        wp.warpTo(10);
      })
      .addOption("Sphere Room", () => {
        this.scene.stop(this.callingSceneKey);
        const wp = new WarpUtility(this);
        wp.warpTo(19);
      })
      .addOption("House", () => {
        this.scene.stop(this.callingSceneKey);
        const wp = new WarpUtility(this);
        wp.warpTo(1);
      })
      .addOption("Start Battle", () => {
        this.input.keyboard.resetKeys();
        this.scene.manager.sleep(this.scene.key);
        this.scene.run("Battle", {
          key: this.scene.key,
          enemyPartyId: 6,
          bossBattle: false,
        });
      })
      .addOption("Credits", () => {
        this.input.keyboard.resetKeys();
        this.scene.manager.sleep(this.scene.key);
        const audio = <AudioScene>this.scene.get("Audio");
        audio.stop();
        this.scene.run("CreditsScene", {
          key: this.scene.key,
          enemyPartyId: 6,
          bossBattle: false,
        });
      })
      .addOption("Cancel", () => {
        this.UI.closePanel(dungeonPanel);
      });
    return dungeonPanel;
  }

  protected setEventListeners() {
    this.UI.initialize();
    this.UI.events.on("menu-traverse", () =>
      this.sound.play("menu-tick", { volume: 0.1 })
    );
    this.UI.events.on("menu-select", () =>
      this.sound.play("menu-select", { volume: 0.1 })
    );
    this.setKeyboardEventListeners();

    this.events.once("close", () => {
      this.closeMenuScene();
    });
  }

  protected startStoreScene() {
    const storeScene = this.scene.get("StoreScene");
    const scenePlugin = new Phaser.Scenes.ScenePlugin(storeScene);
    scenePlugin.bringToTop("StoreScene");
    scenePlugin.setActive(false, "MenuScene");
    scenePlugin.start("StoreScene", {
      callingSceneKey: "MenuScene",
    });
  }

  protected closeMenuScene() {
    this.sound.play("menu-close", { volume: 0.1 });
    this.scene.setActive(true, this.callingSceneKey);
    this.scene.stop();
  }

  protected setKeyboardEventListeners() {
    this.input.keyboard.on("keyup-Z", (event) => {
      this.UI.events.off("menu-select");
      this.UI.events.off("menu-traverse");
      this.closeMenuScene();
    });
  }
}
