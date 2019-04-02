import { Tilemaps } from 'phaser';

class Dialog extends Phaser.GameObjects.Sprite {
  /**
   *
   */
  constructor({ scene, x, y }) {
    super(scene, x, y, 'dialog');
    this.initSprite();
    this.visible = false;
  }
  private initSprite() {
    this.setOrigin(0.5, 0.5);
    this.displayWidth = 160;
    this.displayHeight = 48;
  }
}
export class DialogManager {
  private count = 5;
  private dialog: Dialog;
  private rawText: Phaser.GameObjects.Text;
  constructor(
    private currentScene: Phaser.Scene,
    private hideDialogCallback?: Function
  ) {
    this.dialog = new Dialog({ scene: this.currentScene, x: 80, y: 120 });
    this.dialog.setScrollFactor(0);
    this.currentScene.add.existing(this.dialog);
    this.hideDialogCallback = hideDialogCallback;
  }

  public displayDialog(message: string) {
    this.dialog.visible = true;

   this.rawText = this.currentScene.add.text(4, 98, message, {
      fontFamily: "Connection",
      fontSize: 12,
      fill: '#000000'
    });

    debugger;
  }
  public hideDialog() {
    this.dialog.visible = false;
    this.hideDialogCallback();
  }
  public dialogVisible() {
    return this.dialog.visible;
  }

  public handleNextDialog() {
    this.count--;
    if (!this.count) {
      this.count = 5;
      this.hideDialog();
    }
  }
}
