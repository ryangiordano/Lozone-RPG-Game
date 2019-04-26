import { Combatant } from "./Combatant";
import { CombatantType } from "./Battle";

export class PartyMember extends Combatant {
  constructor(id, name, spriteKey, maxHp, maxMp, level, intellect, dexterity, strength, wisdom, stamina, spells?) {
    super(id, name, spriteKey, maxHp, maxMp, level, intellect, dexterity, strength, wisdom, stamina, spells);
    this.type = CombatantType.partyMember;

  }
}
