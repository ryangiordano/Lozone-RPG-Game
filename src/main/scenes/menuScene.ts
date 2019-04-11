import { UIBuilder } from "../utility/UI/UIBuilder";

export class MenuScene extends Phaser.Scene {
  private uiBuilder: UIBuilder;
  constructor() {
    super({ key: 'MenuScene' });
  }
  preload(): void {
    // Handle loading assets here, adding sounds etc
  }
  init(data) {
    this.uiBuilder = new UIBuilder(this, 'dialog-purple');
    const testPanel = this.uiBuilder.buildPanel({ x: 4, y: 9 }, { x: 0, y: 0 });
    testPanel
      .addListItem('Items', () => console.log('Items Selected'))
      .addListItem('Party', () => console.log('Party Selected'))
      .addListItem('Call Mom', () => console.log('Call Mom Selected'))
      .addListItem('Cancel', () => this.closeMenuScene())
      .renderListItems()
      .initUI();
    this.input.keyboard.on('keydown', event => {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.Z) {
        this.closeMenuScene();
      }

    });
    this.events.on('close',()=>this.closeMenuScene())
  }
  closeMenuScene(){
    //TODO: Make more generic
    this.scene.setActive(true, 'Explore')
    this.scene.stop();
  }
  update(): void { }
  destroyed(){

  }
}