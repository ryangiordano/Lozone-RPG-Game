import { Combatant } from "./Combatant";
import { EnemyConfigObject } from "../../../game";

export class Enemy extends Combatant {
  private lootTable: Item[];
  private experiencePoints: number;
  private goldValue: number;
  constructor({ id, name, spriteKey, hp, mp, level, intellect, dexterity, strength, wisdom, stamina, lootTable, experiencePoints, goldValue, spells }: EnemyConfigObject) {
    super(id, name, spriteKey, hp, mp, level, intellect, dexterity, strength, wisdom, stamina, spells);
    this.lootTable = lootTable;
    this.experiencePoints = experiencePoints;
    this.goldValue = goldValue;

  }
}
