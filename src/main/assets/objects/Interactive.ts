import { EntityTypes } from "./Entity";

export class Interactive extends Phaser.GameObjects.Sprite {
  /**
   * Represents items on the map that react with a message when interacted with.
   */
  public entityType: EntityTypes = EntityTypes.interactive;
  private currentScene: Phaser.Scene;
  public properties: { type: string; id: number | string; message: string };
  constructor({ scene, x, y, properties }) {
    super(scene, x, y, null);
    this.currentScene = scene;
    this.currentScene.add.existing(this);
    this.initSprite();
    this.displayWidth = 64;
    this.displayHeight = 64;
    this.properties = properties;
    this.visible = false;
  }
  private initSprite() {
    this.setOrigin(0.5, 0.5);
    this.currentScene.physics.world.enable(this);
  }
}
