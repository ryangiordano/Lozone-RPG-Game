import { Directions } from '../../utility/Utility';
import { Moveable } from '../../components/entities/Movement';
import { NPCDialog } from '../../data/repositories/NPCRepository';
import { State } from '../../utility/state/State';

export class NPC extends Moveable {
  properties: any = {};
  constructor(
    { scene, x, y, key, map, casts },
    facing?: Directions,
    private dialog?: NPCDialog[],
  ) {
    super({ scene, x, y, key, map, casts });
    this.properties.type = 'npc';
    this.face(facing);
  }

  private getCurrentDialog() {
    const sm = State.getInstance()
    // flags should work by getting the most recent flag in the list
    // that resolves to true.
    const dialog = this.dialog.reduce((acc, dialog) => {
      if (sm.allAreFlagged(dialog.flags)) {
        acc = dialog;
      }
      return acc;

    });
    return dialog.message;
  }
  //TODO: Get the NPC to hold all the messages, check which flags are in play, and react accordingly.;
}
