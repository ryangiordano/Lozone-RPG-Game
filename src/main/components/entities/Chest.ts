//TODO: Split chests and locked chests out into separate entities
// So we don't have to play games with the frames;

import { Entity, EntityTypes } from "./Entity";
import { AudioScene } from "../../scenes/audioScene";
import { State } from "../../utility/state/State";
import { animateItemAbove } from "../../utility/AnimationEffects/item-collect";
import { displayMessage } from "../../scenes/dialogScene";
import { collectItem } from "./KeyItem";

/**
 * Represents a chest on the overworld, able to be opened.
 */
export class Chest extends Entity {
  public properties: { type: string; id: number; message: string };
  public open: Boolean;
  public locked: Boolean;
  constructor({ scene, x, y, properties }, public unlockItemId: number) {
    super({ scene, x, y, key: "chest" });
    this.properties = properties;
    this.entityType = EntityTypes.chest;
  }
  public async openChest() {
    if (!this.open) {
      this.setOpen();
      const audio = <AudioScene>this.scene.scene.get("Audio");
      audio.playSound("chest");
      //TODO: Fix this so that it refers to class body variables and not properties
      await collectItem(
        this.properties["itemId"],
        this.properties["id"],
        this.scene,
        this.x,
        this.y
      );
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
