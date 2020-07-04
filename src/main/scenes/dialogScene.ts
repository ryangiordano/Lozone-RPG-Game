import { BLACK } from "../utility/Constants";
import { wait } from "../utility/Utility";

export interface Dialog {
  content: string;
}

export const displayMessage = (
  message: string[],
  game: Phaser.Game,
  scene: Phaser.Scenes.ScenePlugin
): Promise<any> => {
  return new Promise((resolve) => {
    scene.setActive(false, scene.key);
    game.scene.start("DialogScene", {
      callingSceneKey: scene.key,
      color: "dialog-white",
      message,
    });
    scene.setActive(true, "DialogScene").bringToTop("DialogScene");
    const dialog = game.scene.getScene("DialogScene");
    dialog.events.on("close-dialog", async () => {
      await wait(200);
      dialog.events.off("close-dialog");
      resolve();
    });
  });
};

export class DialogScene extends Phaser.Scene {
  /**
   * Houses dialogs.
   */
  private dialog: Phaser.GameObjects.RenderTexture;
  private dialogArray: string[] = [];
  private currentText: Phaser.GameObjects.Text;
  private bookmark: Function;
  private silent: boolean;
  private color: string;
  private callingSceneKey: string;
  private messages: string[];
  private spaceKey: any;

  constructor() {
    super({ key: "DialogScene" });
  }

  init(data) {
    this.callingSceneKey = data.callingSceneKey;
    this.spaceKey = this.input.keyboard.addKey("Space");
    this.color = data.color || "dialog-white";
    this.silent = data.silent || false;
    this.messages = data.message || [];
    this.dialog = this.add.nineslice(
      0,
      384,
      640,
      192,
      this.color || "dialog-white",
      20
    );
    this.dialog.visible = false;
    this.dialog.setScrollFactor(0);

    this.displayDialog();
  }

  private createDialogArray(messages: string[]) {
    const charsPerDialog = 75;
    const result = [];

    // We need to get the number of chars that can reasonably fit on a line.  Since we're only coding for one screen size
    // We can make a reasonable guess and go off of that. // 130 is a reasonable guess.
    messages.forEach((message) => {
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

  public displayDialog(): Promise<any> {
    this.setKeyboardListeners();

    this.dialog.visible = true;
    this.createDialogArray(this.messages);
    this.handleNextDialog();

    return new Promise((resolve) => {
      this.bookmark = () => {
        resolve();
      };
    });
  }

  public hideDialog() {
    this.dialog.visible = false;
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

      this.scene.setActive(true, this.callingSceneKey);
      this.removeKeyboardListeners();
      this.events.emit("close-dialog");
      this.scene.stop();
    } else {
      !this.silent &&
        this.sound.play("beep", {
          volume: 0.1,
        });
      const toShow = this.dialogArray.shift();

      this.currentText = this.add.text(4 * 4, 99 * 4, toShow, {
        fontFamily: "pixel",
        fontSize: "32px",
        fill: BLACK.hex,
        wordWrap: {
          width: (this.dialog.width / 4.5) * 4,
          useAdvancedWrap: true,
        },
      });
      this.currentText.setScrollFactor(0);
    }
  }
  private setKeyboardListeners() {
    this.spaceKey.on("down", (event) => {
      if (this.dialogVisible()) {
        this.handleNextDialog();
      }
    });
  }
  private removeKeyboardListeners() {
    this.spaceKey.off("down");
  }
}
