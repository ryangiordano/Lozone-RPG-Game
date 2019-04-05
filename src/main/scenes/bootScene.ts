import { AnimationHelper } from "../utility/animation-helper";

export class BootScene extends Phaser.Scene {
  private loadingBar: Phaser.GameObjects.Graphics;
  private progressBar: Phaser.GameObjects.Graphics;
  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    this.sound.add("startup");
    this.cameras.main.setBackgroundColor(0xffffff);
    this.createLoadingGraphics();
    this.load.on(
      "complete",
      () => {
        const daruma = this.add.text(50, 99, "Daruma®", {
          fontFamily: "pixel",
          fontSize: "10px",
          fill: "#000000",
          fontWeight: "bold"
        });
        new AnimationHelper(this, this.cache.json.get("loAnimation"))
        new AnimationHelper(this, this.cache.json.get("ryanAndLoAnimation"))
        const sprite =  this.add.sprite(80,65, 'ryanandlo')
        sprite.scaleX = .3;
        sprite.scaleY = .3;
        sprite.anims.play('shine-in');
        sprite.on('animationcomplete',()=>{
          this.sound.play("startup"); 
        });
      },
      this
    );
    // Load the package
    this.load.pack("preload", "./src/main/assets/pack.json","preload");
    
  }
  private createLoadingGraphics(): void {
    setTimeout(() => {
      this.scene.start("MainScene");
    }, 3000);
  }
}
