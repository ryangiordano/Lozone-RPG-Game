import { UserInterface } from "../../components/UI/UserInterface";
import { State } from "../../utility/state/State";
import { UIPanel } from "../../components/UI/PanelContainer";
import { Item } from "../../components/entities/Item";
import { KeyboardControl } from "../../components/UI/Keyboard";
import { PartyMenuConfig, PartyMenuTypes } from "./UIDataTypes";

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
    this.state.addItemToContents(1);
    // ===================================
    // Main Panel
    // ===================================
    const mainPanel = this.createMainPanel();
    mainPanel.on("items-selected", () => {
      itemPanel.refreshPanel();
      this.UI.showPanel(itemPanel).focusPanel(itemPanel);
    }
    );
    mainPanel.on("party-selected", () =>
      this.startPartyMenuScene({ type: PartyMenuTypes.statusCheck, entity: null })
    );
    mainPanel.on("dungeons-selected", () =>
      this.UI.showPanel(dungeonPanel).focusPanel(dungeonPanel)
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
    // Party Panel
    // ===================================
    const dungeonPanel = this.createDungeonPanel();

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
      // .addOption("Credits", () => {
      //   this.scene.stop(this.callingSceneKey);
      //   this.scene.start("CreditsScene");
      // })
      .addOption("Cancel", () => this.closeMenuScene());
    return mainPanel;
  }
  private createItemPanel() {
    const itemPanel = new ItemPanelContainer(
      { x: 6, y: 9 },
      { x: 4, y: 0 },
      "dialog-white",
      this,
      this.state.getItemsOnPlayer()
    );
    this.UI.addPanel(itemPanel);
    itemPanel.on("item-selected", item => {
      itemPanel.emit("show-and-focus-confirm-panel", item);
    });
    itemPanel.on("panel-close", () => {
      this.UI.closePanel(itemPanel);
    });
    return itemPanel;
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
        //TODO:
        // Open the party panel to select a party member.
        // Pass in item id so that while in the party panel
        // we can reference state to see how much we have left.
        // this.state.consumeItem(item.id);

        // itemConfirmPanel.emit("refresh-items");
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

  private createDungeonPanel() {
    const dungeonPanel = this.UI.createUIPanel({ x: 6, y: 9 }, { x: 4, y: 0 })
      .addOption("Dungeon One", () => {
        this.scene.stop("House");
        this.scene.start("Dungeon", {
          map: "dungeon_1",
          tileset: "dungeon",
          warpId: 1,
          enemyPartyIds: [8, 6, 4, 3, 13]
        });
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
    private items: Item[]
  ) {
    super(dimensions, pos, spriteKey, scene);
    this.addOptionsViaData();
  }

  setPanelData(items: Item[]) {
    this.items = items;
  }

  addOptionsViaData() {
    this.items.forEach(item => {
      // Item Options
      this.addOption(`${item.name} x${item.quantity}`, () => {
        this.emit("item-selected", item);
      });
    });
    this.addOption("Cancel", () => {
      this.emit("panel-close");
    });
  }

  public refreshPanel() {
    this.list = this.list.filter(item => item.type !== "Text");
    this.options = [];
    this.addOptionsViaData();
  }
}
