import { UserInterface } from "../utility/UI/UserInterface";
import { StateManager } from "../utility/state/StateManager";

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
    const mainPanel = this.UI.buildPanel({ x: 3, y: 9 }, { x: 0, y: 0 });
    mainPanel
      .addListItem('Items', () => {
        // this.UI.makePanelActive(itemPanel);
      })
      .addListItem('Party', () => {
        // this.UI.makePanelActive(partyPanel);
      })
      .addListItem('Cancel', () => this.closeMenuScene()).init();

    //   this.UI.makePanelActive(mainPanel);

      // DEBUG ONLY:
      sm.itemRepository.addItemToPlayerContents(1);
      sm.itemRepository.addItemToPlayerContents(2);
      sm.itemRepository.addItemToPlayerContents(3);
      sm.itemRepository.addItemToPlayerContents(1);


    // const itemPanel = this.UI.buildPanel({ x: 7, y: 9 }, { x: 3, y: 0 })
    // sm.itemRepository.getItemsOnPlayer().forEach(item => {
    //   itemPanel.addListItem(item.name, () => sm.itemRepository.consumeItem(item.id));
    // });
    // itemPanel.init();
    // const partyPanel = this.UI.buildPanel({ x: 7, y: 9 }, { x: 3, y: 0 })

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