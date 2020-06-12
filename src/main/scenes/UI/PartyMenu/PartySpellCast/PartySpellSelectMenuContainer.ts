import { PartyMenuContainer } from "../Shared/PartyMenuContainer";
import { CombatEntity } from "../../../../components/battle/CombatDataStructures";
import {
  KeyboardControl,
  KeyboardControlKeys,
} from "../../../../components/UI/Keyboard";
import { PartyMember } from "../../../../components/battle/PartyMember";
import { startScene } from "../../../utility";
export class PartySpellSelectMenuContainer extends PartyMenuContainer {
  constructor(
    scene: Phaser.Scene,
    coordinates: Coords,
    partyMembers: CombatEntity[],
    keyboardControl: KeyboardControl
  ) {
    super(scene, coordinates, partyMembers, keyboardControl);
  }

  protected setSpaceListener() {
    this.keyboardControl.on(
      KeyboardControlKeys.SPACE,
      "party-menu-container",
      () => {
        this.selectPartyMemberToCastSpell();
      }
    );
  }

  private selectPartyMemberToCastSpell() {
    const partyMember: PartyMember = this.getFocusedPartyMember();
    if (partyMember.combatClass.spells.length) {
      const spells = partyMember.combatClass.spells.map((s) => s.spell);
      startScene("PartySpellSelectScene", this.scene, {
        spells,
        caster: partyMember,
      });
    } else {
      this.partyMessagePanel.displayMessage("No spells to cast!");
    }
  }

  private selectPartyMemberToReceiveSpellEffects() {}

  protected selectPartyMemberForItemUse() {}

  protected focusMessage(focusedMember) {
    this.partyMessagePanel.displayMessage(
      `Select from ${focusedMember.partyMember.name}'s spells.`
    );
  }
}
