import { Directions } from "../../utility/Utility";
import { Moveable } from "./Movement";
import { State } from "../../utility/state/State";
import { EntityTypes } from "./Entity";
import { NPCPlacement, NPCDialog } from "../../data/repositories/NPCRepository";

export class NPC extends Moveable {
  public entityType: EntityTypes = EntityTypes.npc;
  constructor(
    { scene, key },
    facing?: Directions,
    protected dialog?: NPCDialog[],
    protected placement?: NPCPlacement[],
    public eventId?: number
  ) {
    super({ scene, x: 0, y: 0, key });

    this.setCurrentPlacement();
    this.face(facing);
  }

  public getCurrentDialog() {
    const sm = State.getInstance();
    // flags should work by getting the most recent flag in the list
    // that resolves to true.
    const dialog = this.dialog.find((dialog) => sm.allAreFlagged(dialog.flags));
    return dialog.message;
  }

  public getCurrentInteraction() {
    const sm = State.getInstance();
    //TODO
  }

  public getCurrentPlacement() {
    const sm = State.getInstance();
    // flags should work by getting the most recent flag in the list
    // that resolves to true.
    const placement = this.placement.reduce((acc, placement) => {
      if (sm.allAreFlagged(placement.flags)) {
        acc = placement;
      }
      return acc;
    });
    return placement;
  }

  private setCurrentPlacement() {
    this.setCollideOnTileBelowFoot(false);
    const loc = this.getCurrentPlacement();
    this.x = loc.x + 32;
    this.y = loc.y + 32;
    this.setCollideOnTileBelowFoot(true);
  }
}

export class BossMonster extends NPC {
  /**
   *  Represents boss monsters on the world map.
   */
  public entityType: EntityTypes = EntityTypes.bossMonster;
  constructor(
    { scene, key },
    public encounterId: number,
    facing?: Directions,
    protected dialog?: NPCDialog[],
    protected placement?: NPCPlacement[]
  ) {
    super({ scene, key }, facing, dialog, placement);
    this.face(facing);
    this.idle();
  }

  idle() {
    this.anims.play(`${this.spriteKey}-idle`);
  }
}
