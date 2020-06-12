import { PartyMenuContainer } from "../Shared/PartyMenuContainer";
import { CombatEntity } from "../../../../components/battle/CombatDataStructures";
import {
  KeyboardControl,
  KeyboardControlKeys,
} from "../../../../components/UI/Keyboard";
import { PartyMenuTypes } from "../../UIDataTypes";
import { PartyMember } from "../../../../components/battle/PartyMember";
import { State } from "../../../../utility/state/State";
import { handleItemUse } from "../../../../components/entities/Item";

export class PartyItemUseMenuContainer extends PartyMenuContainer {
  /**
   *
   */
  constructor(
    scene: Phaser.Scene,
    coordinates: Coords,
    partyMembers: CombatEntity[],
    keyboardControl: KeyboardControl,
    entity: any
  ) {
    super(scene, coordinates, partyMembers, keyboardControl, entity);
  }

  protected setSpaceListener() {
    this.keyboardControl.on(
      KeyboardControlKeys.SPACE,
      "party-menu-container",
      () => {
        this.selectPartyMemberForItemUse();
      }
    );
  }

  protected selectPartyMemberForItemUse() {
    const panel = this.getCurrentlyFocusedPartyMemberPanel();
    const partyMember: PartyMember = panel.partyMember;
    // Item use class.  It'll handle MP/HP/other types of consumables.
    const potency = this.entity.effectPotency * this.entity.effect.basePotency;
    const state = State.getInstance();

    // This isn't working TODO
    if (!state.playerHasItem(this.entity.id)) {
      this.partyMessagePanel.displayMessage(
        `You have no ${this.entity.name} left!`
      );
      return;
    }

    const { resourceFull, resourceRecoverFunction, resource } = handleItemUse(
      partyMember,
      this.entity
    );

    if (!resourceFull) {
      state.consumeItem(this.entity.id);

      const recoveredFor = resourceRecoverFunction.call(partyMember, potency);

      this.partyMessagePanel.displayMessage(
        `Used ${this.entity.name} on ${partyMember.name}.  Recovered ${recoveredFor} ${resource}.`
      );
      panel.setHp(partyMember.currentHp);
      panel.setMp(partyMember.currentMp);

      this.playHealAnimation(panel, this.entity);
    } else {
      this.partyMessagePanel.displayMessage(
        `${partyMember.name} already has full ${resource}!`
      );
    }
    return;
  }

  protected focusMessage(focusedMember) {
    this.partyMessagePanel.displayMessage(
      `Use ${this.entity.name} on ${focusedMember.partyMember.name}?`
    );
  }
}
