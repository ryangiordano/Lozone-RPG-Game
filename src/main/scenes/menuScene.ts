import { UserInterface } from "../utility/UI/UserInterface";
import { StateManager } from "../utility/state/StateManager";
import { DialogPanelContainer } from "../utility/UI/DialogPanelContainer";
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
    const mainPanel = this.UI.createPanel({ x: 3, y: 9 }, { x: 0, y: 0 });
    mainPanel
      .addOption('Items', () => {
        this.UI.showPanel(itemPanel).focusPanel(itemPanel)
      })
      .addOption('Party', () => {
        this.UI.showPanel(partyPanel).focusPanel(partyPanel)
      })
      .addOption('Cancel', () => this.closeMenuScene());
    this.UI.showPanel(mainPanel).focusPanel(mainPanel);
    // DEBUG ONLY:
    sm.itemRepository.addItemToPlayerContents(1);
    sm.itemRepository.addItemToPlayerContents(2);
    sm.itemRepository.addItemToPlayerContents(3);
    sm.itemRepository.addItemToPlayerContents(1);


    // Item Panel
    const itemPanel = this.UI.createPanel({ x: 7, y: 9 }, { x: 3, y: 0 })
    sm.itemRepository.getItemsOnPlayer().forEach(item => {
      // Item Options
      itemPanel.addOption(item.name, () => {
        sm.itemRepository.consumeItem(item.id);
        this.UI.showPanel(itemConfirmPanel);
        this.UI.focusPanel(itemConfirmPanel);
        itemConfirmPanel.setPanelData(item);
      });
    });
    itemPanel.addOption('Cancel',()=>{
       this.UI.closePanel(itemPanel);
    })

    const partyPanel = this.UI.createPanel({ x: 7, y: 9 }, { x: 3, y: 0 })

    // Add item use confirmation panel.
    const itemConfirmPanel = new ConfirmItemPanelContainer({ x: 3, y: 3 }, { x: 7, y: 6 }, 'dialog-blue', this);

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
    super(pos, dimensions, spriteKey, scene);

  }
  setPanelData(item:Item) {
    this.itemData = item;
  }
  getPanelData(){
    return this.itemData;
  }
}