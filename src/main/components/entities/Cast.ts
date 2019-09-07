export enum CastType {
  pressure,
  reach
}
export class Cast extends Phaser.GameObjects.Sprite {
  private currentScene: Phaser.Scene;
  public castType: CastType;
  constructor(scene: Phaser.Scene, coords: Coords, castType?: CastType) {
    super(scene, coords.x, coords.y, null);
    this.castType = castType || CastType.reach;
    this.currentScene = scene;
    this.currentScene.add.existing(this);
    this.initSprite();
    this.displayWidth = 8;
    this.displayHeight = 8;
    this.visible = false;
  }
  private initSprite() {
    this.setOrigin(0.5, 0.5);
    setTimeout(() => {
      this.destroy();
    }, 200)
    this.currentScene.physics.world.enable(this);
  }
}
