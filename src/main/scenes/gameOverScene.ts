import { TextFactory } from "../utility/TextFactory";
import { textFadeIn } from "../utility/tweens/text";
import {
  KeyboardControl,
  KeyboardControlKeys
} from "../components/UI/Keyboard";
export interface Dialog {
  content: string;
}

export class GameOverScene extends Phaser.Scene {
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
  private keys: Map<string, Phaser.Input.Keyboard.Key>;
  private keyboardControl: KeyboardControl;
  constructor() {
    super({ key: "GameOverScene" });
    this.keyboardControl = new KeyboardControl(this);
  }

  init(data) {
    const textFactory = new TextFactory(this);
    const midX = Number(this.game.config.width) / 2;
    const midY = Number(this.game.config.height) / 2;

    const gameOverText = textFactory.createText(
      "Game Over",
      { x: 0, y: 0 },
      "64px",
      { fill: "#ffffff" }
    );
    this.add.existing(gameOverText);
    textFadeIn(gameOverText, 0, 2000, this, () => {
    }).play();

    const returnHomeText = textFactory.createText(
      "Return Home",
      { x: 0, y: 50 },
      "16px",
      { fill: "#ffffff" }
    );

    textFadeIn(returnHomeText, 5000, 2000, this, () => {
      this.setKeyboardListeners();
    }).play();

    this.add.container(midX, midY, [
      gameOverText,
      returnHomeText
    ]);
    this.keyboardControl.setupKeyboardControl();
  }

  private setKeyboardListeners() {
    this.keyboardControl.on(KeyboardControlKeys.SPACE, "game-over", () => {
      this.scene.stop();
      this.scene.run("BootScene", {
        key: this.scene.key,
      });
    });
  }
}
