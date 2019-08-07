import { Combatant } from "./Combatant";
import { CombatantType } from "./CombatDataStructures";

export class PartyMember extends Combatant {
  private experienceCurve: number = 1.2;
  public setExperienceCurve(newCurve) {
    this.experienceCurve = newCurve;
  }
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
    public combatClass: CombatClass,
    public currentExperience,
    public toNextLevel,
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

  public levelUp() {
    this.level += 1;
  }

  public getExperienceToNextLevel(){
    return this.toNextLevel * this.level * this.experienceCurve;
  }

  /**
   * Returns true if leveled up;
   * @param partyMember The party member to gain experience
   * @param experiencePoints Experience points to apply to party member
   */
  public gainExperience(experiencePoints: number) {
    const total = this.currentExperience + experiencePoints;
    const overFlow = total - this.toNextLevel * this.level;
    if (total > this.getExperienceToNextLevel()) {
      this.levelUp();
      this.currentExperience = overFlow;
      return true;
    }
    this.currentExperience = total;
    return false
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