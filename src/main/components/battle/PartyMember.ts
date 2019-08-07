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
    public combatClass:CombatClass,
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

export interface CombatClass {
  name: string,
  id: number,
  maxHp: number
  maxMp: number
  intellect: number
  dexterity: number
  wisdom: number
  stamina: number
  strength: number
  physicalResist: number
  magicalResist: number
}