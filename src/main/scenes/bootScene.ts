import { AnimationHelper } from "../utility/animation-helper";

export class BootScene extends Phaser.Scene {
  private loadingBar: Phaser.GameObjects.Graphics;
  private progressBar: Phaser.GameObjects.Graphics;
  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    this.sound.add("startup");

    this.cameras.main.setBackgroundColor(0x000000);
    this.createLoadingGraphics();

    this.load.on(
      "progress",
      value => {
        this.progressBar.clear();
        this.progressBar.fillStyle(0x88e453, 1);
        this.progressBar.fillRect(
          this.cameras.main.width / 4,
          this.cameras.main.height / 2 - 16,
          (this.cameras.main.width / 2) * value,
          16
        );
      },
      this
    );

    this.load.on(
      "complete",
      () => {
        this.sound.play("startup");
        const animationHelper = new AnimationHelper(this, this.cache.json.get("loAnimation"))
      },
      this
    );

    // Load the package
    this.load.pack("preload", "./src/main/assets/pack.json","preload");
  }
  private createLoadingGraphics(): void {
    setTimeout(() => {
      this.scene.start("MainScene");
    }, 1000);
    this.progressBar = this.add.graphics();
  }
}
