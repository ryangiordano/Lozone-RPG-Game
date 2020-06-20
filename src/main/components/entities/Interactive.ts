import { EntityTypes } from "./Entity";
import { Dialog } from "../UI/Dialog";

interface InteractiveConstructor {
  scene;
  x;
  y;
  message: Dialog;
  eventId: number;
}

/**
 * Represents items on the map that react with a message when interacted with.
 */
export class Interactive extends Phaser.GameObjects.Sprite {
  public entityType: EntityTypes = EntityTypes.interactive;
  private currentScene: Phaser.Scene;
  public event: number;
  public message: Dialog;
  constructor({ scene, x, y, message, eventId }: InteractiveConstructor) {
    super(scene, x, y, null);
    this.currentScene = scene;
    this.currentScene.add.existing(this);
    this.initSprite();
    this.displayWidth = 64;
    this.displayHeight = 64;
    this.visible = false;
    this.message = message;
    this.event = eventId;
  }
  private initSprite() {
    this.setOrigin(0.5, 0.5);
    this.currentScene.physics.world.enable(this);
  }
}
