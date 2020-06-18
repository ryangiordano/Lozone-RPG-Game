import { Entity, EntityTypes } from "../Entity";
import { State } from "../../../utility/state/State";
import { AudioScene } from "../../../scenes/audioScene";
import { animateItemAbove } from "../../../utility/AnimationEffects/item-collect";
import { displayMessage } from "../../../scenes/dialogScene";

/**
 *  Represents unique key items able to be picked up on the overworld.
 */
export class KeyItem extends Entity {
  public flagId: number;
  public itemId: number;
  public entityType = EntityTypes.keyItem;
  constructor({
    scene,
    x,
    y,
    spriteKey,
    frame,
    placementFlags,
    itemId,
    flagId,
  }) {
    super({ scene, x, y, key: spriteKey });
    this.setFrame(frame);
    this.placementFlags = placementFlags;
    this.itemId = itemId;
    this.flagId = flagId;

    const sm = State.getInstance();
    const alreadyCollected = sm.isFlagged(flagId);
    const notYetFlagggedToPlace = !sm.allAreFlagged(placementFlags || []);
    const unPlaced =
      (this.hasPlacementFlags() && notYetFlagggedToPlace) || alreadyCollected;
    this.setPlaced(!unPlaced);
  }
  /**
   * Collects the item, removing it from the map and adding it to the player's inventory.
   */
  public async pickup() {
    this.setVisible(false);
    await collectItem(this.itemId, this.flagId, this.scene, this.x, this.y);
    this.setCollideOnTileBelowFoot(false);
    this.destroy();
  }

  public setPlaced(placed: boolean) {
    this.setActive(placed);
    this.setVisible(placed);
    this.setCollideOnTileBelowFoot(placed);
  }
}

export const collectItem = async (
  itemId: number,
  flagId: number,
  scene: Phaser.Scene,
  x: number,
  y: number
) => {
  const sm = State.getInstance();
  const item = sm.addItemToContents(itemId);
  sm.setFlag(flagId, true);
  const audio = <AudioScene>scene.scene.get("Audio");
  //TODO: Improve this
  if (item.sound === "great-key-item-collect") {
    audio.play(item.sound, true, false, 0.1);
  } else {
    audio.playSound(item.sound, 0.1);
  }
  // item float above here
  await animateItemAbove(item, { x, y }, scene);

  await displayMessage([`Lo got ${item.name}`], scene.game, scene.scene);
};
