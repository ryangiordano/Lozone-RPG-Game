import { Combatant } from "./Combatant";
import { CombatantType, Spell, Status } from "./CombatDataStructures";
import { Equipment, EquipmentSlot } from "../entities/Items/Equipment";

export type BaseStat =
  | "strength"
  | "wisdom"
  | "intellect"
  | "dexterity"
  | "stamina"
  | "hp"
  | "mp"
  | "speed"
  | "physicalResist"
  | "magicalResist";

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
    public combatClass: CombatClass,
    public currentExperience,
    public toNextLevel,
    spells?
  ) {
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
      spells
    );
    this.type = CombatantType.partyMember;
    this.initializeStatus();
  }

  private experienceCurve: number = 1.2;
  public setExperienceCurve(newCurve) {
    this.experienceCurve = newCurve;
  }

  private equipment: {
    [EquipmentSlot.chest]: Equipment;
    [EquipmentSlot.weapon]: Equipment;
    [EquipmentSlot.accessory]: Equipment;
  } = {
    [EquipmentSlot.chest]: null,
    [EquipmentSlot.weapon]: null,
    [EquipmentSlot.accessory]: null,
  };

  public getEquipment() {
    return this.equipment;
  }

  public equip(equipment: Equipment) {
    const slot = equipment.getSlot();
    /** If there are classes or characters specified, make sure this
     * party member meets the requirements.
     */
    const canEquip =
      Boolean(
        equipment.getClasses().length
          ? equipment.getClasses().find((c) => c === this.combatClass.id)
          : true
      ) &&
      Boolean(
        equipment.getCharacters().length
          ? equipment.getCharacters().find((c) => c === this.id)
          : true
      );
    if (canEquip) {
      let unequippedItem;

      if (this.equipment[slot]) {
        unequippedItem = { ...this.equipment[slot] };
      }
      this.equipment[slot] = equipment;
      return {
        successful: true,
        unequippedItem,
      };
    } else {
      return {
        successful: false,
        reason: "Cannot equip",
      };
    }
  }

  public levelUp() {
    this.level += 1;
  }

  public getExperienceToNextLevel() {
    return this.toNextLevel * this.level * this.experienceCurve;
  }

  public getAttackPower() {
    //TODO: Factor in equipment as well, and factor in a modifier.
    return this.modified("strength");
  }

  public getMagicPower() {
    return this.modified("intellect");
  }

  public getDefensePower() {
    return this.modified("stamina") + this.equipmentModifier("physicalResist");
  }

  public getMagicResist() {
    return this.equipmentModifier("magicalResist") + this.modified("wisdom");
  }

  public getSpeed() {
    return this.modified("dexterity") + this.equipmentModifier("speed");
  }

  public getStrength() {
    return this.modified("strength");
  }

  public getStamina() {
    return this.modified("stamina");
  }
  public getDexterity() {
    return this.modified("dexterity");
  }

  public getIntellect() {
    return this.modified("intellect");
  }

  public getWisdom() {
    return this.modified("wisdom");
  }

  /**
   * These are getters for maxHp and maxMp, which represent the base values.
   */
  public getMaxHp() {
    return (
      Math.floor((1 + this.getStamina() / 10) * this.maxHp) +
      this.equipmentModifier("hp")
    );
  }

  public getMaxMp() {
    return (
      Math.floor((1 + this.getWisdom() / 10) * this.maxMp) +
      this.equipmentModifier("mp")
    );
  }

  /**
   * the modified getters take the party member's class into consideration
   */
  private modified(baseStat: BaseStat) {
    if (!this[baseStat]) {
      throw new Error(`Base state ${baseStat} does not exist on ${this.name}`);
    }

    return Math.floor(
      this[baseStat] * this.combatClass[baseStat] * this.levelModifier() +
        this.equipmentModifier(baseStat)
    );
  }

  /** Add the potency granted by equipped item to stats */
  private equipmentModifier(baseStat: BaseStat) {
    let statBoost = 0;
    for (const e in this.equipment) {
      statBoost += this.equipment[e]
        ? this.equipment[e].getModifiers().reduce((acc, m) => {
            if (m.modifierStatType === baseStat) {
              acc += m.modifierPotency;
            }
            return acc;
          }, 0)
        : 0;
    }

    return statBoost;
  }

  setCurrentHp(currentHp) {
    this.currentHp = currentHp || this.getMaxHp();
  }
  setCurrentMp(currentMp) {
    this.currentMp = currentMp || this.getMaxMp();
  }

  // ===================================
  // Leveling up
  // ===================================
  /**
   * Returns true if leveled up;  Recursively adds experience points to characters.
   * @param partyMember The party member to gain experience
   * @param experiencePoints Experience points to apply to party member
   */
  public gainExperience(experiencePoints: number) {
    let leveledUp = false;
    const total = this.currentExperience + experiencePoints;
    const overFlow = total - this.toNextLevel * this.level;
    while (total > this.getExperienceToNextLevel()) {
      this.levelUp();
      leveledUp = true;
      this.currentExperience = 0;
      this.gainExperience(overFlow);
    }
    this.currentExperience = leveledUp ? overFlow : total;
    return leveledUp;
  }

  public clearStatus() {
    this.status = new Set();
  }

  /**
   * Set the party member to fainted status, change the sprite to the fainted spritebundleRenderer.renderToStream
   */
  handleFaint() {
    this.clearStatus();
    this.addStatusCondition(Status.fainted);
    this.faint();
    this.effectManager.addEffect(6);
  }

  revive() {
    this.removeStatusCondition(Status.fainted);
    this.setCurrentHp(1);
    this.standUp();
    this.effectManager.removeEffect(6);
    return "Revived!";
  }
}

export interface ClassSpell {
  requiredLevel: number;
  classModifier: number;
  spell: Spell;
}

export interface CombatClass {
  name: string;
  id: number;
  maxHp: number;
  maxMp: number;
  intellect: number;
  dexterity: number;
  wisdom: number;
  stamina: number;
  strength: number;
  physicalResist: number;
  magicalResist: number;
  spells: ClassSpell[];
}
