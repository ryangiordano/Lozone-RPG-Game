import { EntityTypes } from "./Entity";
import { Interactive } from "../../data/controllers/InteractivesController";
import { State } from "../../utility/state/State";
import { Switchable } from "./Switchable";
import { AudioScene } from "../../scenes/audioScene";

/**
 * An block with a blocking state and a passthrough state
 */
export class Block extends Switchable {
  constructor({ scene, x, y }, flagId, public erect: boolean = false) {
    super({ scene, x, y }, flagId, "block", 0, 4, ["A happy lil block!"]);
    this.entityType = EntityTypes.block;
    this.setFrame(erect ? this.activeFrame : this.inactiveFrame);
    this.setCollideOnTileBelowFoot(erect);
  }

  setRetracted() {
    this.erect = false;
    this.anims.play("block-down");
    this.setCollideOnTileBelowFoot(false);
  }
  setErected() {
    this.erect = true;
    this.anims.play("block-up");
    this.setCollideOnTileBelowFoot(true);
  }

  setErect(on: boolean) {
    const audio = <AudioScene>this.scene.scene.get("Audio");
    if (on) {
      if (!this.erect) {
        this.setErected();
        audio.playSound("erect", 0.1);
      }
    } else {
      if (this.erect) {
        this.setRetracted();
        audio.playSound("flaccid", 0.1);
      }
    }
  }
}
