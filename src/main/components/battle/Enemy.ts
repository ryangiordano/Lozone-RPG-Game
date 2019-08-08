import { Combatant } from "./Combatant";
import { Item } from "../entities/Item";
import { CombatantType } from "./CombatDataStructures";

export class Enemy extends Combatant {
  public lootTable: Item[];
  public experiencePoints: number;
  public goldValue: number;
  constructor(
    id,
    name,
    spriteKey,
    hp,
    mp,
    level,
    intellect,
    dexterity,
    strength,
    wisdom,
    stamina,
    lootTable,
    experiencePoints,
    goldValue,
    physicalResist,
    magicalResist,
    spells?
  ) {
    super(
      id,
      name,
      spriteKey,
      hp,
      mp,
      level,
      intellect,
      dexterity,
      strength,
      wisdom,
      stamina,
      physicalResist,
      magicalResist,
      spells
    );
    this.initializeStatus();

    this.lootTable = lootTable;
    this.experiencePoints = experiencePoints;
    this.goldValue = goldValue;
    this.type = CombatantType.enemy;
  }
}
