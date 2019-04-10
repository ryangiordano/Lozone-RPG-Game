import { UIBuilder } from "../utility/UI/UIBuilder";

export class MenuScene extends Phaser.Scene {
  private uiBuilder: UIBuilder;
  constructor() {
    super({ key: 'MenuScene' });
    console.log("Menu Scene created");
  }
  preload(): void {
    // Handle loading assets here, adding sounds etc
  }
  init(data) {
    this.uiBuilder = new UIBuilder(this);

    console.log("I'm a menu I'm a menu")
    // Get passed the data from scene.start('SceneName', {data})
    // Create tleset here.
    this.input.keyboard.on('keydown', event => {

      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ESC) {
        
        this.scene.setActive(true, 'Explore')
        // this.scene.start('Explore');
        this.scene.setActive(false);

      }

    });
  }
  update(): void { }
}