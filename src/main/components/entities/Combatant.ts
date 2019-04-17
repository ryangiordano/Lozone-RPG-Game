enum Status {
  sleep,
  paralyzed,
  blinded,
  confused,
  fainted
}

class Spell {
  public id: number;
  constructor() {

  }
}
// For use with items and spells.
class Effect {

}
class Modifier {
  public id: number;
}
class Behavior {
  public id: number;
}
export class CurrentStatus {
  constructor(currentHP, currentMP, status, modifiers: Modifier[]) {

  }
}
// export class Spell
export class Combatant {
  private modifiers: Modifier[];
  private behaviors: Map<number, Behavior>;
  private spells: Map<number, Spell>
  public currentHp: number;
  public currentMp: number;
  public status: Map<number, Status>;
  constructor(
    public id: number,
    public name: string,
    private spriteKey: string,
    private hp: number,
    private mp: number,
    private level: number,
    private attackPower: number,
    private defensePower: number,
    private intellect: number,
    private dexterity: number,
    private stength: number,
    private wisdom: number,
    private stamina: number,
    spells?: Spell[]) {
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
  initializeStatus({ currentHp, currentMp, statusArray, modifierArray }) {
    this.currentHp = currentHp || this.hp;
    this.currentMp = currentMp || this.mp;
    this.status = statusArray || [];
    this.modifiers = modifierArray || [];
  }
  addSpell(spell: Spell) {
    if(!this.spells.has(spell.id)){
      this.spells.set(spell.id, spell);
    }
  }
  removeSpell(spellId) {
    this.spells.delete(spellId);
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
