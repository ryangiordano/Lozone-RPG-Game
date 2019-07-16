export interface Dialog {
  content: string;
}

class DialogSprite extends Phaser.GameObjects.Sprite {
  /**
   *
   */
  constructor({ scene, x, y }) {
    super(scene, x, y, "dialog-sprite");
    this.initSprite();
    this.visible = false;
  }
  private initSprite() {
    this.setOrigin(0.5, 0.5);
    this.displayWidth = 160 * 4;
    this.displayHeight = 48 * 4;
  }
}
export class DialogManager {
  private dialog: DialogSprite;
  private dialogArray: string[] = [];
  private currentText: Phaser.GameObjects.Text;
  constructor(
    private currentScene: Phaser.Scene,
    private hideDialogCallback?: Function
  ) {
    this.dialog = new DialogSprite({
      scene: this.currentScene,
      x: 320,
      y: 480
    });
    this.dialog.setScrollFactor(0);
    this.currentScene.add.existing(this.dialog);
    this.hideDialogCallback = hideDialogCallback;

    this.setKeyboardListeners();
  }

  private createDialogArray(messages: string[]) {
    const charsPerDialog = 75;
    const result = [];

    // We need to get the number of chars that can reasonably fit on a line.  Since we're only coding for one screen size
    // We can make a reasonable guess and go off of that. // 130 is a reasonable guess.
    messages.forEach(message => {
      const textArray = message.split("");

      while (textArray.length) {
        let start = charsPerDialog;
        while (textArray[start] && textArray[start] !== " ") {
          start--;
        }
        result.push(textArray.splice(0, start).join(""));
      }
    });
    this.dialogArray = result.reduce((acc, el) => {
      acc.push(el);
      return acc;
    }, []);
  }

  public displayDialog(message: string[]): Promise<any> {
    this.setKeyboardListeners();
    this.dialog.visible = true;
    this.createDialogArray(message);
    this.handleNextDialog();
    return new Promise(resolve => {
      this.currentScene.events.on("dialog-finished", () => {
        console.log("Resolved");
        resolve();
      });
    });
  }

  public hideDialog() {
    this.dialog.visible = false;
    this.hideDialogCallback();
  }

  public dialogVisible() {
    return this.dialog.visible;
  }

  public handleNextDialog() {
    console.log(this.currentScene);
    if (this.currentText) {
      this.currentText.destroy();
    }

    if (!this.dialogArray.length) {
      this.currentScene.events.emit("dialog-finished");
      this.hideDialog();
    } else {
      this.currentScene.sound.play("beep");
      const toShow = this.dialogArray.shift();

      this.currentText = this.currentScene.add.text(4 * 4, 99 * 4, toShow, {
        fontFamily: "pixel",
        fontSize: "32px",
        fill: "#000000",
        wordWrap: {
          width: (this.dialog.width / 4.5) * 4,
          useAdvancedWrap: true
        }
      });
      this.currentText.setScrollFactor(0);
    }
  }
  private setKeyboardListeners() {
    this.currentScene.input.keyboard.on("keydown", event => {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE) {
        // If there is dialog on screen, cycle through the text.
        if (this.dialogVisible()) {
          this.handleNextDialog();
        }
      }
    });
  }
}
