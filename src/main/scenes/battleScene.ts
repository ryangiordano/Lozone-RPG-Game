export class BattleScene extends Phaser.Scene{
  /**
   *
   */
  constructor() {
    super('Battle');
    
  }
  init(data){
    console.log("Battle scene")
    this.input.keyboard.on('keydown', event => {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ESC) {
        // If there is dialog on screen, cycle through the text.
        this.scene.stop();
        debugger;
        this.scene.manager.resume(data.key);
        this.scene.bringToTop(data.key)
        console.log("???")
      }
    });
  }
}