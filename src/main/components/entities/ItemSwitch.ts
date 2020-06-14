import { Entity, EntityTypes } from "./Entity";
import { Interactive } from "../../data/controllers/InteractivesController";
import { State } from "../../utility/state/State";
import { Switchable } from "./Switchable";

/**
 * An item that can be switched on if the NPC holds a specific key item
 */
export class ItemSwitch extends Switchable {
  constructor({ scene, x, y }, private interactive: Interactive) {
    super(
      { scene, x, y },
      interactive.flagId,
      interactive.spriteKey,
      interactive.activeFrame,
      interactive.frame,
      interactive.defaultDialog.content
    );
    this.entityType = EntityTypes.itemSwitch;
    this.setFrame(this.isActive() ? this.activeFrame : this.inactiveFrame);
    const tint = Number(this.interactive.color);
    this.setTint(tint);
  }

  getKeyItemId() {
    return this.interactive.keyItemId;
  }

  isActive() {
    const sm = State.getInstance();
    return sm.allAreFlagged([this.flagId]);
  }

  getActivateDialog() {
    return this.interactive.activateDialog.content;
  }

  canActivateSwitch(itemId: number) {
    return itemId === this.interactive.keyItemId;
  }

  getCurrentDialog() {
    return this.isActive()
      ? this.interactive.validDialog.content
      : this.interactive.defaultDialog.content;
  }

  activateSwitch() {
    this.setFrame(this.interactive.activeFrame);
    const sm = State.getInstance();
    sm.setFlag(this.interactive.flagId, true);
  }
}
