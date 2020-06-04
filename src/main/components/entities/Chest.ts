//TODO: Split chests and locked chests out into separate entities
// So we don't have to play games with the frames;

import { Entity, EntityTypes } from "./Entity";
import { AudioScene } from "../../scenes/audioScene";

/**
 * Represents a chest on the overworld, able to be opened.
 */
export class Chest extends Entity {
  public properties: { type: string; id: number | string; message: string };
  public open: Boolean;
  public locked: Boolean;
  constructor({ scene, x, y, properties }, public unlockItemId: number) {
    super({ scene, x, y, key: "chest" });
    this.properties = properties;
    this.entityType = EntityTypes.chest;
  }
  public openChest() {
    if (!this.open) {
      this.setOpen();
      const audio = <AudioScene>this.scene.scene.get("Audio");
      audio.playSound("chest");
      this.currentScene.events.emit("item-acquired", {
        itemId: this.properties["itemId"],
        flagId: this.properties["id"],
        chestCoords: { x: this.x, y: this.y },
      });
    }
  }
  public setOpen() {
    this.open = true;
    this.unlockItemId ? this.setFrame(5, false) : this.setFrame(1, false);
  }
  public lock() {
    this.locked = true;
    this.setFrame(4, false);
  }
  public unlock() {
    const audio = <AudioScene>this.scene.scene.get("Audio");
    audio.playSound("unlock");
    this.locked = false;
  }
}
