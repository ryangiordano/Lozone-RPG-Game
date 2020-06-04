import { Entity, EntityTypes } from "./Entity";
import { AudioScene } from "../../scenes/audioScene";

/**
 *  Represents locked doors on the map.
 */
export class LockedDoor extends Entity {
  constructor(
    { scene, x, y, map, properties },
    public unlockItemId: number,
    public lockMessage = `It's locked tight.`,
    public unlockMessage = `The door clicks open!`
  ) {
    super({ scene, x, y, key: "door" });
    this.properties = properties;
    this.entityType = EntityTypes.door;
  }
  public unlock() {
    const audio = <AudioScene>this.scene.scene.get("Audio");
    audio.playSound("lock-open");
    this.setCollideOnTileBelowFoot(false);
    this.destroy();
  }
}
