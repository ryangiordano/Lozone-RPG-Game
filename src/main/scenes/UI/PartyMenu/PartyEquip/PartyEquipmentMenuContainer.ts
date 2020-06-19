import { wait } from "./../../../../utility/Utility";
import { displayMessage } from "./../../../dialogScene";
import { PartyMenuContainer } from "../Shared/PartyMenuContainer";
import { CombatEntity } from "../../../../components/battle/CombatDataStructures";
import {
  KeyboardControl,
  KeyboardControlKeys,
} from "../../../../components/UI/Keyboard";
import { PartyMember } from "../../../../components/battle/PartyMember";
import { State } from "../../../../utility/state/State";
import {
  Equipment,
  EquipmentSlot,
} from "../../../../components/entities/Items/Equipment";
import { AudioScene } from "../../../audioScene";

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
      state.removeItemFromContents(this.equipment.id);
      if (result.unequippedItem) {
        state.addItemToContents(result.unequippedItem.id);
      }

      const audio = <AudioScene>this.scene.scene.get("Audio");
      audio.playSound("defense", 0.1);
      switch (this.equipment.getSlot()) {
        case EquipmentSlot.accessory:
          panel.setAccessorySlot(this.equipment);
          break;
        case EquipmentSlot.weapon:
          panel.setWeaponSlot(this.equipment);
          break;
        case EquipmentSlot.chest:
          panel.setArmorSlot(this.equipment);
          break;
      }
      await displayMessage(
        [`Equipped the ${this.equipment.name}`],
        this.scene.game,
        this.scene.scene
      );
      if (!state.playerHasItem(this.equipment.id)) {
        this.emit("close-menu");
      }
    } else {
      this.partyMessagePanel.displayMessage(result.reason);
    }
  }

  protected focusMessage(focusedMember) {
    this.partyMessagePanel.displayMessage(
      `Equip ${this.entity.name} on ${focusedMember.partyMember.name}?`
    );
  }
}
