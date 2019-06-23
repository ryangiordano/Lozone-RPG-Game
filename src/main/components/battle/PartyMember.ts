import { Combatant } from "./Combatant";
import { CombatantType } from "./CombatDataStructures";

export class PartyMember extends Combatant {
  constructor(
    id,
    name,
    spriteKey,
    maxHp,
    maxMp,
    level,
    intellect,
    dexterity,
    strength,
    wisdom,
    stamina,
    physicalResist,
    magicalResist,
    spells?) {
    super(
      id,
      name,
      spriteKey,
      maxHp,
      maxMp,
      level,
      intellect,
      dexterity,
      strength,
      wisdom,
      stamina,
      physicalResist,
      magicalResist,
      spells);
    this.type = CombatantType.partyMember;

  }
}
