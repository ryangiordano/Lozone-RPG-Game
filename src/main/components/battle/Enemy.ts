import { Combatant } from "./Combatant";
import { Item } from "../entities/Item";
import { CombatantType } from "./Battle";

export class Enemy extends Combatant {
  public lootTable: Item[];
  public experiencePoints: number;
  public goldValue: number;
  constructor(id, name, spriteKey, hp, mp, level, intellect, dexterity, strength, wisdom, stamina, lootTable, experiencePoints, goldValue, spells?) {
    super(id, name, spriteKey, hp, mp, level, intellect, dexterity, strength, wisdom, stamina, spells);
    this.lootTable = lootTable;
    this.experiencePoints = experiencePoints;
    this.goldValue = goldValue;
    this.type = CombatantType.enemy;
  }
}
