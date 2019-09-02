import { Directions } from '../../utility/Utility';
import { Moveable } from './Movement';
import { NPCDialog, NPCPlacement } from '../../data/repositories/NPCRepository';
import { State } from '../../utility/state/State';
import { EntityTypes } from './Entity';


export class NPC extends Moveable {
  public entityType: EntityTypes = EntityTypes.npc;
  properties: any = {};
  constructor(
    { scene, key, casts },
    facing?: Directions,
    protected dialog?: NPCDialog[],
    protected placement?: NPCPlacement[]
  ) {
    super({ scene, x: 0, y: 0, key, casts });

    this.setCurrentPlacement();
    this.face(facing);
  }

  public getCurrentDialog() {
    const sm = State.getInstance()
    // flags should work by getting the most recent flag in the list
    // that resolves to true.
    const dialog = this.dialog.find(dialog => sm.allAreFlagged(dialog.flags));
    return dialog.message;
  }

  public getCurrentPlacement() {
    const sm = State.getInstance()
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

  constructor({ scene, key, map, casts },
    public encounterId: number,
    facing?: Directions,
    protected dialog?: NPCDialog[],
    protected placement?: NPCPlacement[]) {
    super({ scene, key, casts }, facing, dialog, placement);
    this.face(facing);
    this.idle()
  }

  triggerBattle(battleId) {

  }

  idle() {
    this.anims.play(`${this.spriteKey}-idle`)
  }
}