export class Lo extends Phaser.GameObjects.Sprite {
  protected currentScene: Phaser.Scene;
  protected keys: Map<string, Phaser.Input.Keyboard.Key>;
  /**
   *
   */
  constructor({ scene, x, y, key }) {
    super(scene, x, y, key);
    this.currentScene = scene;
    this.initSprite();
    this.currentScene.add.existing(this);
  }
  protected getKeys(): Map<string, Phaser.Input.Keyboard.Key> {
    return this.keys;
  }
  protected initSprite() {
    this.setOrigin(0.5, 0.5);
    this.setFlipX(false);
    this.keys = new Map([
      ["LEFT", this.addKey("LEFT")],
      ["RIGHT", this.addKey("RIGHT")],
      ["DOWN", this.addKey("DOWN")],
      ["UP", this.addKey("UP")]
    ]);

    this.currentScene.physics.world.enable(this);
    this.body.maxVelocity.x = 50;
    this.body.maxVelocity.y = 300;
  }
  protected addKey(key: string): Phaser.Input.Keyboard.Key {
    return this.currentScene.input.keyboard.addKey(key);
  }
  update(): void {
    this.handleInput();
  }
  protected handleInput() {
    if (this.keys.get("RIGHT").isDown) {
      this.body.setAccelerationX(1);
      console.log("RIGHT");
      this.setFlipX(false);
    } else if (this.keys.get("LEFT").isDown) {
      console.log("LEFT");

      this.body.setAccelerationX(-1);
      this.setFlipX(true);
    } else if (this.keys.get("DOWN").isDown) {
      console.log("DOWN");

      this.body.setAccelerationY(-1);
    } else if (this.keys.get("UP").isDown) {
      console.log("UP");

      this.body.setAccelerationY(1);
    }
  }
}
