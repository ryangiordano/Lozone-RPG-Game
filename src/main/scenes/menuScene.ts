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
    const mainPanel = this.UI.createPanel({ x: 3, y: 9 }, { x: 0, y: 0 });
    mainPanel
      .addOption('Items', () => {
        this.UI.focusPanel(itemPanel);
      })
      .addOption('Party', () => {
        this.UI.focusPanel(partyPanel);
      })
      .addOption('Cancel', () => this.closeMenuScene()).showPanel();

      this.UI.focusPanel(mainPanel);
    // DEBUG ONLY:
    sm.itemRepository.addItemToPlayerContents(1);
    sm.itemRepository.addItemToPlayerContents(2);
    sm.itemRepository.addItemToPlayerContents(3);
    sm.itemRepository.addItemToPlayerContents(1);


    const itemPanel = this.UI.createPanel({ x: 7, y: 9 }, { x: 3, y: 0 })
    sm.itemRepository.getItemsOnPlayer().forEach(item => {
      itemPanel.addOption(item.name, () =>{
        sm.itemRepository.consumeItem(item.id);
        //Maybe make this a UI method?
        itemConfirmPanel.showPanel();
        this.UI.focusPanel(itemPanel);
      });
    });

    const partyPanel = this.UI.createPanel({ x: 7, y: 9 }, { x: 3, y: 0 })

    const itemConfirmPanel = this.UI.createPanel({x:2,y:2}, {x:6,y:6});

    itemConfirmPanel.addOption('Use',({id})=>{
      sm.itemRepository.consumeItem(id);

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