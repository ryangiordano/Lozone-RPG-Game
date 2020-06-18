import { displayMessage } from "./../../../dialogScene";
import { PartyMenuContainer } from "../Shared/PartyMenuContainer";
import { CombatEntity } from "../../../../components/battle/CombatDataStructures";
import {
  KeyboardControl,
  KeyboardControlKeys,
} from "../../../../components/UI/Keyboard";
import { PartyMember } from "../../../../components/battle/PartyMember";
import { State } from "../../../../utility/state/State";
import { Equipment } from "../../../../components/entities/Items/Equipment";

export class PartyEquipmentMenuContainer extends PartyMenuContainer {
  /**
   *
   */
  constructor(
    scene: Phaser.Scene,
    coordinates: Coords,
    partyMembers: CombatEntity[],
    keyboardControl: KeyboardControl,
    private equipment: Equipment
  ) {
    super(scene, coordinates, partyMembers, keyboardControl, equipment);
  }

  protected setSpaceListener() {
    this.keyboardControl.on(
      KeyboardControlKeys.SPACE,
      "party-menu-container",
      () => {
        this.selectPartyMemberForEquip();
      }
    );
  }

  protected async selectPartyMemberForEquip() {
    const panel = this.getCurrentlyFocusedPartyMemberPanel();
    const partyMember: PartyMember = panel.partyMember;
    const state = State.getInstance();

    const result = partyMember.equip(this.equipment);
    if (result.successful) {
      console.log(this.equipment.id);
      state.removeItemFromContents(this.equipment.id);
      if (result.unequippedItem) {
        console.log(result.unequippedItem.id);
        state.addItemToContents(result.unequippedItem.id);
      }
      await displayMessage(
        [`Equipped the ${this.equipment.name}`],
        this.scene.game,
        this.scene.scene
      );
      this.emit("close-menu");
    } else {
      this.partyMessagePanel.displayMessage(result.reason);
    }
  }

  protected focusMessage(focusedMember) {
    console.log(focusedMember, this.entity);
    this.partyMessagePanel.displayMessage(
      `Equip ${this.entity.name} on ${focusedMember.partyMember.name}?`
    );
  }
}
