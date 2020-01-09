import {
  IBuff,
  Behavior,
  Spell,
  Status,
  CombatActionTypes,
  CombatResult,
  CombatantType
} from "./CombatDataStructures";
import { getUID, Directions } from "../../utility/Utility";
import { Defend } from "./Actions";
import { Buff } from "./Buff";
import { Item, handleItemUse } from "../entities/Item";
import { SpellType } from "../../data/repositories/SpellRepository";
import { EffectsRepository } from "../../data/repositories/EffectRepository";

class EffectManager {
  private effectContainer: Phaser.GameObjects.Container;
  private effectRepository: EffectsRepository;
  constructor(private scene: Phaser.Scene, private sprite: Phaser.GameObjects.Sprite) {
    this.effectContainer = new Phaser.GameObjects.Container(scene);
    this.effectRepository = new EffectsRepository(scene.game);
  }

  addEffect(effectId: number) {
    const effect = this.effectRepository.getById(effectId);
    effect.play(this.sprite.x, this.sprite.y, this.scene, this.effectContainer);

  }

  public getEffectContainer() {
    return this.effectContainer;
  }
}

export class Combatant {
  private buffs: Map<number, Buff>;
  private behaviors: Map<number, Behavior>;
  private spells: Map<number, Spell>;
  public currentHp: number;
  public currentMp: number;
  public status: Set<Status>;
  public type: CombatantType;
  protected sprite: Phaser.GameObjects.Sprite;
  protected effectManager: EffectManager;
  public uid: string = getUID();
  protected currentParty;
  constructor(
    public id: number,
    public name: string,
    public spriteKey: string,
    public maxHp: number,
    public maxMp: number,
    public level: number,
    public intellect: number,
    public dexterity: number,
    public strength: number,
    public wisdom: number,
    public stamina: number,
    public physicalResist: number,
    public magicalResist: number,
    spells?: Spell[]
  ) {
    this.status = new Set<Status>();
    this.buffs = new Map<number, Buff>();
    this.spells = new Map<number, Spell>();
    if (spells) {
      spells.forEach(this.addSpell);
    }
  }
  public setSprite(scene: Phaser.Scene, direction?: Directions) {
    this.sprite = new Phaser.GameObjects.Sprite(scene, 0, 0, this.spriteKey);
    this.effectManager = new EffectManager(scene, this.sprite);
    this.sprite.setOrigin(.5, .5);
    this.sprite.setAlpha(1);
    if (direction === Directions.right) {
      this.faceRight();
    }
    if (direction === Directions.left) {
      this.faceLeft();
    }
  }
  faceRight() {
    this.sprite.setFrame(6);
    this.sprite.flipX = true;
  }
  faceLeft() {
    this.sprite.setFrame(6);
    this.sprite.flipX = false;
  }
  faint() {
    this.sprite.setFrame(9);
  }
  addBehaviors(behaviors: Behavior[]) {
    behaviors.forEach(behavior => {
      if (!this.behaviors.has(behavior.id)) {
        this.behaviors.set(behavior.id, behavior);
      }
    });
  }
  initializeStatus(
    currentHp?: number,
    currentMp?: number,
    statusArray: Status[] = [],
    buffArray: Buff[] = []
  ) {
    this.setCurrentHp(currentHp);
    this.setCurrentMp(currentMp);
    statusArray.forEach(status => {
      this.status.add(status);
    });
    buffArray.forEach(buff => {
      if (!this.buffs.has(buff.id)) {
        this.buffs.set(buff.id, buff);
      }
    });
  }

  setCurrentHp(currentHp) {
    this.currentHp = currentHp || this.maxHp;
  }
  setCurrentMp(currentMp) {
    this.currentMp = currentMp || this.maxMp;
  }

  private canCastSpell(spell: Spell): boolean {
    const { manaCost } = spell;
    return this.currentMp - manaCost >= 0;
  }
  /**
   * Return true if successful, false otherwise.
   * @param spell 
   */
  private subtractSpellCostFromMp(spell: Spell): boolean {
    const { manaCost } = spell;
    if (this.currentMp - manaCost >= 0) {
      this.setCurrentMp(this.currentMp - manaCost);
      return true;
    }
    return false;
  }

  addSpell(spell: Spell) {
    if (!this.spells.has(spell.id)) {
      this.spells.set(spell.id, spell);
    }
  }
  removeSpell(spellId) {
    this.spells.delete(spellId);
  }
  attackTarget(targets: Combatant[]): CombatResult[] {
    const potency = this.getAttackPower();
    return targets.map(t => {
      const damageDone = t.receivePhysicalDamage(potency);
      return {
        actionType: CombatActionTypes.attack,
        executor: this,
        target: t,
        resultingValue: damageDone,
        targetDown: t.currentHp === 0
      };
    })

  }

  public castSpell(spell: Spell, targets: Combatant[]): CombatResult[] {
    const potency = this.getMagicPower() + spell.basePotency;
    let combatResults;
    if (this.canCastSpell(spell)) {
      this.subtractSpellCostFromMp(spell)

      combatResults = targets.map(t => {
        let resultingValue;
        switch (spell.type) {
          case SpellType.attack:
            resultingValue = t.receiveMagicalDamage(potency);
            break;
          case SpellType.restoration:
            resultingValue = t.healFor(potency);
            break;
          default:
            console.error(`SpellType not supported: ${spell.type}`)
        }
        return {
          actionType: CombatActionTypes.castSpell,
          executor: this,
          target: t,
          resultingValue: resultingValue,
          targetDown: t.currentHp === 0
        }
      });

      return combatResults;
    }
    combatResults = targets.map(t => {
      return {
        actionType: CombatActionTypes.failure,
        executor: this,
        target: t,
        resultingValue: 0,
        targetDown: false
      }
    })
    return combatResults;

  }

  applyItem(item: Item): CombatResult[] {
    const potency = item.effectPotency * item.effect.basePotency;
    const { resourceRecoverFunction } = handleItemUse(this, item);
    const healedFor = resourceRecoverFunction.call(this, potency);
    return [{
      actionType: CombatActionTypes.attack,
      executor: null,
      target: this,
      resultingValue: healedFor,
      targetDown: this.currentHp === 0
    }]
  }

  failedAction(targets: Combatant[]): CombatResult[] {
    const results = targets.map(t => ({
      actionType: CombatActionTypes.failure,
      executor: this,
      target: t,
      resultingValue: 0,
      targetDown: t.currentHp === 0
    }))
    return results;
  }
  receivePhysicalDamage(potency: number) {
    const defensePotency = this.getDefensePower();
    const actualDamage = Math.max(1, potency - defensePotency);
    this.damageFor(actualDamage);
    return actualDamage;
  }

  receiveMagicalDamage(potency: number) {
    const magicResistPotency = this.getMagicResist();
    const actualDamage = Math.max(1, potency - magicResistPotency);
    this.damageFor(actualDamage);
    return actualDamage;
  }
  public getAttackPower() {
    return this.strength * this.level;
  }
  public getMagicPower() {
    return this.intellect * this.level;
  }
  public getDefensePower() {
    return this.stamina * this.level;
  }

  public getMagicResist() {
    return (this.magicalResist * this.level) + (this.wisdom * this.level);
  }

  public getSpeed() {
    return this.dexterity * this.level;
  }

  public getCritChance() {
    return this.dexterity * .01;
  }
  public getModifierValue() { }
  // Ad a defense up buff that lasts one turn to yourself.
  public defendSelf() {
    //TODO: Implement defending self
    // this.buffs.set()
  }

  public getMaxHp() {
    return this.maxHp;
  }

  public getMaxMp() {
    return this.maxMp;
  }

  private changeCurrent(property, value: number) {
    property = Math.min(property + value, property);
  }
  public healFor(hitPoints: number): number {
    const missingHealth = this.getMaxHp() - this.currentHp;
    this.currentHp = Math.min(this.getMaxHp(), this.currentHp + hitPoints);
    return Math.min(missingHealth, hitPoints)
  }
  public recoverManaFor(manaPoints: number): number {
    const missingMana = this.getMaxMp() - this.currentMp;
    this.currentMp = Math.min(this.getMaxMp(), this.currentMp + manaPoints);
    return Math.min(missingMana, manaPoints)
  }
  public damageFor(hitPoints: number) {
    this.currentHp = Math.max(0, this.currentHp - hitPoints);
    if (this.currentHp === 0) {
    }
  }
  public addStatusCondition(status: Status) {
    this.status.add(status);
  }
  public removeStatusCondition(status: Status) {
    this.status.delete(status);
  }
  public setX(x: number) {
    this.sprite.setX(x);
  }
  public setY(y: number) {
    this.sprite.setX(y);
  }
  public getSprite() {
    return this.sprite;
  }
  public setParty(party) {
    this.currentParty = party;
  }
  public getParty() {
    return this.currentParty;
  }
  public getEffectManager() {
    return this.effectManager;
  }
}
