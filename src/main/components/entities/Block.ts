import { CircuitController } from "./../../data/controllers/CircuitController";
import { EntityTypes } from "./Entity";
import { Interactive } from "../../data/controllers/InteractivesController";
import { State } from "../../utility/state/State";
import { Switchable } from "./Switchable";
import { AudioScene } from "../../scenes/audioScene";
import { Circuit } from "../../data/repositories/CircuitRepository";

/**
 * An block with a blocking state and a passthrough state
 */
export class Block extends Switchable {
  constructor(
    { scene, x, y },
    public erect: boolean = false,
    private circuit: Circuit
  ) {
    super({ scene, x, y }, null, "block", 0, 4, ["A happy lil block!"]);
    this.entityType = EntityTypes.block;
    this.setTint(circuit.color);
    this.setFrame(erect ? this.activeFrame : this.inactiveFrame);
    this.setCollideOnTileBelowFoot(erect);
  }

  public circuitIsActive() {
    const cc = new CircuitController(this.scene.game);
    return cc.circuitIsActive(this.circuit.id);
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

/**A block that allows for passage over pits */
export class PitBlock extends Switchable {
  constructor(
    { scene, x, y },
    public erect: boolean = false,
    private circuit: Circuit
  ) {
    super({ scene, x, y }, null, "pit-block", 3, 0, ["A happy lil pit block!"]);
    this.entityType = EntityTypes.block;
    this.setTint(circuit.color);
    this.setFrame(erect ? this.activeFrame : this.inactiveFrame);
    this.setCollideOnTileBelowFoot(!erect);
  }

  public circuitIsActive() {
    const cc = new CircuitController(this.scene.game);
    return cc.circuitIsActive(this.circuit.id);
  }

  setRetracted() {
    this.erect = false;
    this.anims.play("pit-block-down");
    this.setCollideOnTileBelowFoot(true);
  }
  setErected() {
    this.erect = true;
    this.anims.play("pit-block-up");
    this.setCollideOnTileBelowFoot(false);
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
