import { AnimationHelper } from "../../games/space-invaders/helpers/animation-helper";

export class BootScene extends Phaser.Scene {
  private loadingBar: Phaser.GameObjects.Graphics;
  private progressBar: Phaser.GameObjects.Graphics;
  private startupSound;
  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    this.startupSound = this.sound.add("startup");

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
      },
      this
    );

    // Load the package
    this.load.pack("preload", "./src/main/assets/pack.json");
  }
  private createLoadingGraphics(): void {
    setTimeout(() => {
      this.scene.start("MainScene");
    }, 3000);
    this.progressBar = this.add.graphics();
  }
}
