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

export class Combatant {
  private buffs: Map<number, Buff>;
  private behaviors: Map<number, Behavior>;
  private spells: Map<number, Spell>;
  public currentHp: number;
  public currentMp: number;
  public status: Set<Status>;
  public type: CombatantType;
  private sprite: Phaser.GameObjects.Sprite;
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
    this.initializeStatus();
    this.spells = new Map<number, Spell>();
    if (spells) {
      spells.forEach(this.addSpell);
    }
  }
  /**
   * Creates a new sprite and sets it to the scene
   * @param scene Scene for the sprite to be set to
   * @param direction The direction the sprite should be facing.
   */
  public setSprite(scene: Phaser.Scene, direction?: Directions) {
    this.sprite = new Phaser.GameObjects.Sprite(scene, 0, 0, this.spriteKey);
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
    this.sprite.setFrame(8);
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
    this.currentHp = currentHp || this.maxHp;
    this.currentMp = currentMp || this.maxMp;
    statusArray.forEach(status => {
      this.status.add(status);
    });
    buffArray.forEach(buff => {
      if (!this.buffs.has(buff.id)) {
        this.buffs.set(buff.id, buff);
      }
    });
  }
  addSpell(spell: Spell) {
    if (!this.spells.has(spell.id)) {
      this.spells.set(spell.id, spell);
    }
  }
  removeSpell(spellId) {
    this.spells.delete(spellId);
  }
  attackTarget(target: Combatant): CombatResult {
    const potency = this.getAttackPower();
    const damageDone = target.receivePhysicalDamage(potency);
    return {
      actionType: CombatActionTypes.attack,
      executor: this,
      target,
      resultingValue: damageDone,
      targetDown: target.currentHp === 0
    };
  }
  failedAction(target: Combatant): CombatResult {
    return {
      actionType: CombatActionTypes.failure,
      executor: this,
      target,
      resultingValue: 0,
      targetDown: target.currentHp === 0
    };
  }
  receivePhysicalDamage(potency: number) {
    const defensePotency = this.getDefensePower();
    const actualDamage = Math.max(1, potency - defensePotency);
    this.damageFor(actualDamage);
    return actualDamage;
  }
  getAttackPower() {
    //TODO: Factor in equipment as well, and factor in a modifier.
    return this.strength * this.level;
  }
  public getMagicPower() {
    return this.intellect * this.level;
  }
  public getDefensePower() {
    return this.stamina * this.level;
  }
  public getModifierValue() {}
  // Ad a defense up buff that lasts one turn to yourself.
  public defendSelf() {
    console.log("defended");
    //TODO: Implement defending self
    // this.buffs.set()
  }
  private changeCurrent(property, value: number) {
    property = Math.min(property + value, property);
  }
  public healFor(hitPoints: number) {
    this.currentHp = Math.min(this.maxHp, this.currentHp + hitPoints);
  }
  public damageFor(hitPoints: number) {
    this.currentHp = Math.max(0, this.currentHp - hitPoints);
    if (this.currentHp === 0) {
      console.log("We ded.");
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
}