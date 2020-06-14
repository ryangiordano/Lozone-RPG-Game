import { Entity, EntityTypes } from "./Entity";
import { Interactive } from "../../data/controllers/InteractivesController";
import { State } from "../../utility/state/State";
import { Dialog } from "../UI/Dialog";
import { AudioScene } from "../../scenes/audioScene";

/**
 * An object that can switch between active and inactive phases.
 */
export class Switchable extends Entity {
  constructor(
    { scene, x, y },
    public flagId: number,
    protected spriteKey: string,
    protected activeFrame: number,
    protected inactiveFrame: number,
    protected defaultDialog: string[]
  ) {
    super({ scene, x, y, key: spriteKey });
    this.setFrame(this.isActive() ? activeFrame : inactiveFrame);
  }

  isActive() {
    const sm = State.getInstance();
    return sm.allAreFlagged([this.flagId]);
  }

  getCurrentDialog() {
    return this.defaultDialog;
  }
}

export class Switcher extends Entity {
  constructor({ scene, x, y }, public flagId) {
    super({ scene, x, y, key: "switch" });
    this.entityType = EntityTypes.switch;

    this.setFrame(this.isActive() ? 1 : 0);
  }

  isActive() {
    const sm = State.getInstance();
    return sm.allAreFlagged([this.flagId]);
  }

  flip() {
    const sm = State.getInstance();
    const flagged = sm.allAreFlagged([this.flagId]);
    const flippingOn = !flagged;
    this.setFrame(flippingOn ? 1 : 0);
    sm.setFlag(this.flagId, flippingOn);
    const audio = <AudioScene>this.scene.scene.get("Audio");
    audio.playSound("unlock");
  }
}
