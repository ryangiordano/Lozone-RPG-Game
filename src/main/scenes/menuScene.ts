import { UserInterface } from "../components/UI/UserInterface";
import { StateManager } from "../utility/state/StateManager";
import { DialogPanelContainer } from "../components/UI/DialogPanelContainer";
import { Item } from "../utility/state/ItemRepository";

export class MenuScene extends Phaser.Scene {
  private UI: UserInterface;
  constructor() {
    super({ key: 'MenuScene' });
  }
  preload(): void {
    // Handle loading assets here, adding sounds etc
  }
  init(data) {
    const sm = StateManager.getInstance();
    this.UI = new UserInterface(this, 'dialog-white');
    const mainPanel = this.UI.createPanel({ x: 4, y: 9 }, { x: 0, y: 0 });
    mainPanel
      .addOption('Items', () => {
        this.UI.showPanel(itemPanel).focusPanel(itemPanel)
      })
      .addOption('Party', () => {
        this.UI.showPanel(partyPanel).focusPanel(partyPanel)
      })
      .addOption('Dungeons', () => {
        this.UI.showPanel(dungeonPanel).focusPanel(dungeonPanel)
      })
      .addOption('Credits', () => {
        this.scene.start('CreditsScene');
      })
      .addOption('Cancel', () => this.closeMenuScene());

    this.UI.showPanel(mainPanel).focusPanel(mainPanel);

    // Item Panel
    const itemPanel = new ItemPanelContainer({ x: 6, y: 9 }, { x: 4, y: 0 }, 'dialog-white', this, sm.itemRepository.getItemsOnPlayer());
    this.UI.addPanel(itemPanel)
    itemPanel.on('item-selected', (item) => {
      this.UI.showPanel(itemConfirmPanel);
      this.UI.focusPanel(itemConfirmPanel);
      itemConfirmPanel.setPanelData(item);
    });
    itemPanel.on('panel-close', () => {
      this.UI.closePanel(itemPanel);
    })

    // Add item use confirmation panel.
    const itemConfirmPanel = new ConfirmItemPanelContainer({ x: 3, y: 3 }, { x: 7, y: 6 }, 'dialog-white', this);

    this.UI.addPanel(itemConfirmPanel);
    // Add option for confirmation
    itemConfirmPanel.addOption('Use', () => {
      const item = itemConfirmPanel.getPanelData();
      sm.itemRepository.consumeItem(item.id);
      itemPanel.refreshPanel();
      this.UI.closePanel(itemConfirmPanel);

    }).addOption('Drop', () => {
      const item = itemConfirmPanel.getPanelData();
      sm.itemRepository.removeItemFromPlayerContents(item.id);
      itemPanel.refreshPanel();
      this.UI.closePanel(itemConfirmPanel);
    })
      .addOption('Cancel', () => {
        this.UI.closePanel(itemConfirmPanel);
      })

    // Party Panel
    const partyPanel = this.UI.createPanel({ x: 6, y: 9 }, { x: 4, y: 0 }).addOption('Cancel', () => {
      this.UI.closePanel(partyPanel);
    });

    const dungeonPanel = this.UI.createPanel({ x: 6, y: 9 }, { x: 4, y: 0 })
      .addOption('Dungeon One', () => {
        this.scene.stop('House')
        this.scene.start('Dungeon', { map: 'dungeon_1', tileset: 'dungeon', warpId: 1 });
        
      })
      .addOption('Cancel', () => {
        this.UI.closePanel(dungeonPanel);
      })

    this.input.keyboard.on('keydown', event => {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.Z) {
        this.closeMenuScene();
      }

    });

    this.events.on('close', () => this.closeMenuScene())
  }

  closeMenuScene() {
    //TODO: Make more generic
    this.scene.setActive(true, 'Explore')
    this.events.off('close', () => this.closeMenuScene());
    this.scene.stop();
  }
  update(): void { }
  destroyed() {

  }
}



class ConfirmItemPanelContainer extends DialogPanelContainer {
  private itemData: Item;
  constructor(dimensions: Coords,
    pos: Coords,
    spriteKey: string,
    scene: Phaser.Scene) {
    super(dimensions, pos, spriteKey, scene);

  }
  setPanelData(item: Item) {
    this.itemData = item;
  }
  getPanelData() {
    return this.itemData;
  }
}

class ItemPanelContainer extends DialogPanelContainer {
  constructor(dimensions: Coords,
    pos: Coords,
    spriteKey: string,
    scene: Phaser.Scene, private items: Item[]) {
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
        this.emit('item-selected', item);
      });
    });
    this.addOption('Cancel', () => {
      this.emit('panel-close');
    })
  }
  refreshPanel() {
    this.list = this.list.filter(item => item.type !== "Text");
    this.options = [];
    this.addOptionsViaData();
  }

}