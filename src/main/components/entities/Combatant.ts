enum Status {
  sleep,
  paralyzed,
  blinded,
  confused,
  fainted
}
enum ModifierStatType {
  strength, stamina, speed, intellect, wisdom, dexterity, hp, mp
}

class Spell {
  constructor(
    public id: number,
    public name: string,
    public effectId: number, 
    public potency: number) {

  }
}
class Modifier {
  constructor(
    public id: number,
    public name: string,
    public modifierStatType: ModifierStatType,
    public modifierPotency: number) {

  }
}
class Buff {
  constructor(
    public id: number,
    public modifiers: Modifier[],
    public name: string) {

  }
}
class Behavior {
  public id: number;
}
// For use with items and spells.
class Effect {

}
// export class Spell
export class Combatant {
  private buffs: Map<number, Buff>;
  private behaviors: Map<number, Behavior>;
  private spells: Map<number, Spell>
  public currentHp: number;
  public currentMp: number;
  public status: Set<Status>;
  constructor(
    public id: number,
    public name: string,
    private spriteKey: string,
    private hp: number,
    private mp: number,
    private level: number,
    private intellect: number,
    private dexterity: number,
    private strength: number,
    private wisdom: number,
    private stamina: number,
    spells?: Spell[]) {
    this.status = new Set<Status>();
    this.buffs = new Map<number, Buff>();

    this.spells = new Map<number, Spell>();
    if (spells) {
      spells.forEach(this.addSpell)
    }
  }
  addBehaviors(behaviors: Behavior[]) {
    behaviors.forEach(behavior => {
      if (!this.behaviors.has(behavior.id)) {
        this.behaviors.set(behavior.id, behavior);
      }
    })
  }
  initializeStatus(currentHp: number, currentMp: number, statusArray: Status[] = [], buffArray: Buff[] = []) {
    this.currentHp = currentHp || this.hp;
    this.currentMp = currentMp || this.mp;
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
  attackTarget(target: Combatant) {
    const potency = this.getAttackPower();
    target.receivePhysicalDamage(potency);

  }
  receivePhysicalDamage(potency: number) {
    const defensePotency = this.getDefensePower();
    const actualDamage = Math.max(0, defensePotency - potency);
  }
  getAttackPower() {
    //TODO: Factor in equipment as well
    return this.strength * this.level;
  }
  getDefensePower() {
    return this.stamina * this.level;
  }
  getModifierValue() {

  }
  private changeCurrent(property, value: number) {
    property = Math.min(property + value, property);
  }
  public healFor(property, value: number) {
    this.changeCurrent(property, value);
  }
  public damageFor(property, value: number) {
    this.changeCurrent(property, -value);
  }
}
