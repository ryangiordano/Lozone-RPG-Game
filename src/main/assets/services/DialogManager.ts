class Dialog extends Phaser.GameObjects.Sprite {
  /**
   *
   */
  constructor({ scene, x, y }) {
    super(scene, x, y, "dialog");
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
  private dialog: Dialog;
  private dialogArray: string[] = [];
  private currentText: Phaser.GameObjects.Text;
  constructor(
    private currentScene: Phaser.Scene,
    private hideDialogCallback?: Function
  ) {
    this.dialog = new Dialog({ scene: this.currentScene, x: 80, y: 120 });
    this.dialog.setScrollFactor(0);
    this.currentScene.add.existing(this.dialog);
    this.hideDialogCallback = hideDialogCallback;
  }

  private createDialogArray(message: string) {
    const charsPerDialog = 75;
    const result = [];
    let text = message.split("");

    // We need to get the number of chars that can reasonably fit on a line.  Since we're only coding for one screen size
    // We can make a reasonable guess and go off of that. // 130 is a reasonable guess.
    // debugger;
    while (text.length) {
      let start = charsPerDialog;
      while (text[start] && text[start] !== " ") {
        start--;
      }
      result.push(text.splice(0, start).join(""));
    }
    this.dialogArray = result.reduce((acc, el) => {
      acc.push(el);
      return acc;
    }, []);
  }
  displayTextInDialog() {}
  public displayDialog(message: string) {
    this.dialog.visible = true;
    this.createDialogArray(message);
    this.handleNextDialog();
  }
  public hideDialog() {
    this.dialog.visible = false;
    this.hideDialogCallback();
  }
  public dialogVisible() {
    return this.dialog.visible;
  }

  public handleNextDialog() {
    if (this.currentText) {
      this.currentText.destroy();
    }

    if (!this.dialogArray.length) {
      this.hideDialog();
    } else {
      const toShow = this.dialogArray.shift();

      this.currentText = this.currentScene.add.text(4, 99, toShow, {
        fontFamily: "pixel",
        fontSize: "8px",
        fill: "#000000",
        wordWrap: { width: this.dialog.width / 4.5, useAdvancedWrap: true }
      });
      this.currentText.setScrollFactor(0);
    }
  }
}
