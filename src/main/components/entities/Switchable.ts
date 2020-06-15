import { Entity, EntityTypes } from "./Entity";
import { Interactive } from "../../data/controllers/InteractivesController";
import { State } from "../../utility/state/State";
import { Dialog } from "../UI/Dialog";
import { AudioScene } from "../../scenes/audioScene";
import { CircuitController } from "../../data/controllers/CircuitController";
import { Circuit } from "../../data/repositories/CircuitRepository";

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

/** Level for changing current in circuits */
export class Switcher extends Entity {
  constructor({ scene, x, y }, private circuit: Circuit) {
    super({ scene, x, y, key: "switch" });
    this.entityType = EntityTypes.switch;

    this.setTint(circuit.color);
    this.setFrame(this.isActive() ? 1 : 0);
  }

  isActive() {
    const cc = new CircuitController(this.scene.game);
    return cc.circuitIsActive(this.circuit.id);
  }

  flip() {
    const cc = new CircuitController(this.scene.game);
    const active = cc.circuitIsActive(this.circuit.id);
    const sm = State.getInstance();
    const flippingOn = !active;
    this.setFrame(flippingOn ? 1 : 0);
    cc.activateCircuit(!active, this.circuit.id);
    const audio = <AudioScene>this.scene.scene.get("Audio");
    audio.playSound("unlock");
  }
}
