import { Combatant } from "./Combatant";
import { CombatantType } from "./CombatDataStructures";

export class PartyMember extends Combatant {
  private experienceCurve: number = 0.2;
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
      this.initializeStatus();
  }

  public levelUp() {
    this.level += 1;
  }

  public getExperienceToNextLevel() {
    return this.toNextLevel * this.level * this.experienceCurve;
  }

  public getAttackPower() {
    //TODO: Factor in equipment as well, and factor in a modifier.
    return this.modified('strength');
  }

  public getMagicPower() {
    return this.modified('intellect');
  }

  public getDefensePower() {
    return this.modified('stamina');
  }

  public getSpeed() {
    return this.modified('dexterity');
  }

  public getCritChance() {
    return this.modified('dexterity') * .01;
  }

  private levelModifier() {
    return 1 + this.level / 10;
  }

  public getStrength() {
    return this.modified('strength')
  }
  
  public getStamina() {
    return this.modified('stamina')
  }
  public getDexterity() {
    return this.modified('dexterity')
  }

  public getIntellect() {
    return this.modified('intellect')
  }

  public getWisdom() {
    return this.modified('wisdom')
  }

  public getCurrentHp() {

  }
  /**
   * These are getters for maxHp and maxMp, which represent the base values.
   */
  public getMaxHp() {
    return Math.floor((1 + this.getStamina() / 10) * this.maxHp);
  }

  public getMaxMp() {
    return Math.floor((1 + this.getWisdom() / 10 )* this.maxMp);
  }

  /**
   * the modified getters take the party member's class into consideration
   */
  private modified(baseStat) {
    if (!this[baseStat]) {
      throw new Error(`Base state ${baseStat} does not exist on ${this.name}`)
    }
    return Math.floor(this[baseStat] * this.combatClass[baseStat] * this.levelModifier());
  }

  setCurrentHp(currentHp){
    console.log("fired")
    this.currentHp = currentHp || this.getMaxHp();
  }
  setCurrentMp(currentMp){
    this.currentMp = currentMp || this.getMaxMp();
  }

  // ===================================
  // Leveling up
  // ===================================
  /**
   * Returns true if leveled up;
   * @param partyMember The party member to gain experience
   * @param experiencePoints Experience points to apply to party member
   */
  public gainExperience(experiencePoints: number) {
    const total = this.currentExperience + experiencePoints;
    const overFlow = total - this.toNextLevel * this.level;
    if (total > this.getExperienceToNextLevel()) {
      // TODO: If player gains more than one level...things get messy.
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