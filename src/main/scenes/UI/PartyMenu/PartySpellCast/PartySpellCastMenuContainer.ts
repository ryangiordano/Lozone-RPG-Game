import { PartyMenuContainer } from "../Shared/PartyMenuContainer";
import {
  CombatEntity,
  Spell,
} from "../../../../components/battle/CombatDataStructures";
import {
  KeyboardControl,
  KeyboardControlKeys,
} from "../../../../components/UI/Keyboard";
import { PartyMember } from "../../../../components/battle/PartyMember";

export class PartySpellCastMenuContainer extends PartyMenuContainer {
  constructor(
    scene: Phaser.Scene,
    coordinates: Coords,
    partyMembers: CombatEntity[],
    keyboardControl: KeyboardControl,
    private spell: Spell,
    private caster: PartyMember
  ) {
    super(scene, coordinates, partyMembers, keyboardControl);
  }

  protected setSpaceListener() {
    this.keyboardControl.on(
      KeyboardControlKeys.SPACE,
      "party-menu-container",
      () => {
        this.selectPartyMemberToCastSpellOn();
      }
    );
  }

  private selectPartyMemberToCastSpellOn() {
    const targetPanel = this.getCurrentlyFocusedPartyMemberPanel();
    const casterPanel = this.getPartyMemberPanelById(this.caster.id);
    const castTarget: PartyMember = this.getFocusedPartyMember();
    if (this.caster.currentMp - this.spell.manaCost < 0) {
      this.partyMessagePanel.displayMessage("Not enough MP to cast!");
    } else if (castTarget.currentHp === castTarget.getMaxHp()) {
      this.partyMessagePanel.displayMessage("HP already full!");
    } else {
      const results = this.caster.castSpell(this.spell, [castTarget]);
      this.partyMessagePanel.displayMessage(
        `${castTarget.name} recovered ${results[0].resultingValue} HP.`
      );

      targetPanel.setHp(results[0].target.currentHp);
      targetPanel.setMp(results[0].target.currentMp);
      casterPanel.setHp(results[0].executor.currentHp);
      casterPanel.setMp(results[0].executor.currentMp);
      this.spell.animationEffect.play(95, 55, this.scene, targetPanel);
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
