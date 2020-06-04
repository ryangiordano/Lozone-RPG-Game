import { Entity, EntityTypes } from "./Entity";

/**
 *  Represents unique key items able to be picked up on the overworld.
 */
export class KeyItem extends Entity {
  public properties: { type: string; id: number | string; message: string };
  constructor({ scene, x, y, properties }) {
    const { spriteKey, frame } = properties;
    super({ scene, x, y, key: spriteKey });
    this.properties = properties;
    this.setFrame(frame);
    this.entityType = EntityTypes.keyItem;
  }
  /**
   * Collects the item, removing it from the map and adding it to the player's inventory.
   */
  public pickup() {
    this.currentScene.events.emit("item-acquired", {
      itemId: this.properties["itemId"],
      flagId: this.properties["flagId"],
      isKeyItem: true,
      chestCoords: { x: this.x, y: this.y },
    });
    this.setCollideOnTileBelowFoot(false);
    this.destroy();
  }
}
