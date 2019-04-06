export class Cast extends Phaser.GameObjects.Sprite {
  private currentScene: Phaser.Scene;
  constructor({ scene, x, y }) {
    super(scene, x, y, null);
    this.currentScene = scene;
    this.currentScene.add.existing(this);
    this.initSprite();
    this.displayWidth = 8;
    this.displayHeight = 8;
    this.visible = true;
  }
  private initSprite() {
    this.setOrigin(0.5, 0.5);
    setTimeout(()=>{
      this.destroy();
    },200)
    this.currentScene.physics.world.enable(this);
  }
}
