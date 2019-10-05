import { Combatant } from "./Combatant";
import {
  CombatActionTypes,
  CombatResult,
  Orientation
} from "./CombatDataStructures";
import { TextFactory } from "../../utility/TextFactory";
import { textScaleUp, slowScaleUp } from "../../utility/tweens/text";
import {
  characterAttack,
  characterDamage
} from "../../utility/tweens/character";
import { Item } from '../entities/Item';
import { State } from "../../utility/state/State";
import { SpellController } from "../../data/controllers/SpellController";
import { EffectsRepository } from '../../data/repositories/EffectRepository';
import { Spell } from './CombatDataStructures';
import { SpellType } from "../../data/repositories/SpellRepository";


//TODO: Refactor this to take care of less stuff.  It does too much;
/**
 * Is an object meant to be stored in an array of CombatEvents and then interated
 * over during the course of a turn.
 */
export class CombatEvent {
  //TODO: Abstract this out to be different classes inheriting from CombatEvent;
  public type: CombatActionTypes = null;
  private effectsRepository: EffectsRepository;
  protected textFactory: TextFactory;
  constructor(
    public executor: Combatant,
    public targets: Combatant[],
    public action: CombatActionTypes,
    protected orientation: Orientation,
    protected scene: Phaser.Scene,
  ) {
    this.textFactory = new TextFactory(scene);
    this.effectsRepository = new EffectsRepository(this.scene.game);
  }

  public async executeAction(): Promise<CombatResult[]> {
    return new Promise(async resolve => {
      const executor = this.executor;
      const targets = this.confirmTargets();
      let results;
      // This is where we implement our Actions.ts actions.
      if (this.action === CombatActionTypes.attack) {
        if (!targets.length || !this.executorIsValid()) {
          return resolve(this.returnFailedAction(executor, targets));
        }
        results = await this.handleAttack(executor, targets);
      }
      if (this.action === CombatActionTypes.defend) {
        results = await this.handleDefend(executor);
      }
      return resolve(results);
    });
  }

  protected async handleDefend(executor: Combatant): Promise<any> {
    return new Promise(async resolve => {
      executor.defendSelf();
      const results: CombatResult = {
        actionType: CombatActionTypes.defend,
        executor,
        target: executor,
        resultingValue: 0,
        targetDown: false
      };
      const text = this.createCombatText("^", this.executor);
      await this.playFadeUp(text);
      results.message = [`${this.executor.name} is defending.`];
      return resolve(results);
    });
  }

  protected async handleAttack(
    executor: Combatant,
    targets: Combatant[]
  ): Promise<any> {
    return new Promise(async resolve => {
      const modifier = this.orientation === Orientation.left ? 1 : -1;
      const results: CombatResult[] = executor.attackTarget(targets);
      await this.playMemberAttack(executor.getSprite(), modifier * 25);
      await Promise.all(targets.map(t => this.playCombatantTakeDamage(t.getSprite())));
      const texts = results.map(r => this.createCombatText(r.resultingValue.toString(), r.target));
      await Promise.all(texts.map(t => this.playCombatText(t)));
      results.forEach(r => {
        r.message = [`${executor.name} attacks ${r.target.name} for ${r.resultingValue}`,
        `${r.target.name} has ${r.target.currentHp} HP out of ${r.target.getMaxHp()} left.`];
        return r;
      });
      return resolve(results);
    });
  }


  protected returnFailedAction(
    executor: Combatant,
    targets: Combatant[]
  ): CombatResult[] {
    return executor.failedAction(targets);
  }

  protected createCombatText(
    value: string,
    combatant: Combatant,
    color: string = "#ffffff"
  ): Phaser.GameObjects.Text {
    const sprite = combatant.getSprite();
    const container = combatant.getSprite().parentContainer;
    const valueText = this.textFactory.createText(
      value,
      { x: sprite.x, y: sprite.y },
      "60px",
      { fill: color }
    );

    this.scene.add.existing(valueText);
    container.add(valueText);

    return valueText;
  }

  public playCombatText(textObject): Promise<any> {
    return new Promise(resolve => {
      const tween = textScaleUp(textObject, 0, this.scene, () => {
        textObject.destroy();
        resolve();
      });
      tween.play();
    });
  }

  /**
   * Plays the animation for attacking
   * @param partyMember 
   * @param distance 
   */
  public playMemberAttack(partyMember, distance): Promise<any> {
    return new Promise(resolve => {
      const tween = characterAttack(
        partyMember,
        distance,
        0.0,
        this.scene,
        () => {
          resolve();
        }
      );
      tween.play();
    });
  }

  playCombatantTakeDamage(combatant: Phaser.GameObjects.Sprite): Promise<any> {
    return new Promise(resolve => {
      const tween = characterDamage(combatant, 0.0, this.scene, () => {
        resolve();
      });
      tween.play();
      const hitEffect = this.effectsRepository.getById(3);
      hitEffect.play(combatant.x, combatant.y, this.scene, combatant.parentContainer);

    });
  }

  playFadeUp(sprite): Promise<any> {
    return new Promise(resolve => {
      const tween = slowScaleUp(sprite, this.scene, () => {
        resolve();
      });
      tween.play();
    });
  }

  protected confirmTargets(): Combatant[] {
    if (this.targets.length > 1) {
      // Multiple targets
      this.targets = this.targets.filter(t => t.currentHp > 0)
    } else {
      // Single target

      if (this.targets[0] && this.targets[0].currentHp <= 0) {
        const nextTargetable = this.targets[0]
          .getParty()
          .members.find(potentialTarget => potentialTarget.entity.currentHp > 0);
        if (nextTargetable) {
          this.targets = [nextTargetable.entity];
        }
      }
    }
    return this.targets;
  }

  protected executorIsValid(): boolean {
    return this.executor.currentHp > 0;
  }
}


export class SpellCastEvent extends CombatEvent {
  /**
   * Handles the case when a player chooses to use a spell.
   */
  public type: CombatActionTypes = CombatActionTypes.castSpell;
  constructor(
    executor: Combatant,
    targets: Combatant[],
    action: CombatActionTypes,
    orientation: Orientation,
    scene: Phaser.Scene,
    private spell: Spell,
  ) {
    super(executor, targets, action, orientation, scene)
  }
  /**
   * Handles the case when a spell is cast.
   * @param executor 
   * @param target 
   */
  protected async handleSpellCast(executor: Combatant, targets: Combatant[]): Promise<any> {
    return new Promise(async resolve => {
      //TODO: Handle offensive or assistive magic here;
      // Handle mana check.  Lower mana here, NOT in executor.castSpell.  Otherwise, we use mana on every iteration.

      const results: CombatResult[] = executor.castSpell(this.spell, targets);
      if (this.spell.primaryAnimationEffect) {
        await this.spell.primaryAnimationEffect.play(0, 0, this.scene, targets[0].getSprite().parentContainer);
      }

      await Promise.all(results.map(r => {
        const targetSprite = r.target.getSprite();
        return this.spell.animationEffect.play(
          targetSprite.x,
          targetSprite.y,
          this.scene,
          targetSprite.parentContainer)
      }));
      let color;
      switch (this.spell.type) {
        case SpellType.restoration:
          color = "#92e8a2";
          break;
        case SpellType.attack:
          color = "#ffffff";
          break;
        case SpellType.manaRecover:
          color = "#3181f7";
          break;
        default:
          color = "#ffffff";
      }
      const texts = results.map(r => this.createCombatText(
        r.resultingValue.toString(),
        r.target,
        color
      ));

      await Promise.all(texts.map(t => this.playCombatText(t)));
      results.forEach(r => {
        const message = [
          `${executor.name} uses the ${this.spell.name} on ${r.target.name}.  ${r.target.name} is healed for ${r.resultingValue} HP`,
          `${r.target.name} has ${r.target.currentHp} HP out of ${r.target.getMaxHp()} left.`
        ];
        r.message = message;
      });

      return resolve(results);
    });
  }

  protected async handleMultiSpellCast(executor: Combatant, ) {

  }

  public async executeAction(): Promise<CombatResult[]> {
    return new Promise(async resolve => {
      const executor = this.executor;
      const targets = this.confirmTargets();
      let results;
      if (!targets.length || !this.executorIsValid()) {
        return resolve(this.returnFailedAction(executor, targets));
      }
      results = await this.handleSpellCast(executor, targets);
      return resolve(results);
    });
  }
}

export class UseItemEvent extends CombatEvent {
  /**
   * Handles the case when a player chooses to use an item during battle.
   */
  public type: CombatActionTypes = CombatActionTypes.useItem;
  constructor(
    executor: Combatant,
    targets: Combatant[],
    action: CombatActionTypes,
    orientation: Orientation,
    scene: Phaser.Scene,
    private item: Item,
  ) {
    super(executor, targets, action, orientation, scene)
  }

  /**
   * Handles the case when an item is used.
   * @param executor 
   * @param target 
   */
  protected async handleUseItem(executor: Combatant, targets: Combatant[]): Promise<any> {
    return new Promise(async resolve => {
      const results: CombatResult[] = targets[0].applyItem(this.item);

      await Promise.all(targets.map(async t => {
        const targetSprite = t.getSprite();
        await this.item.effect.animationEffect.play(targetSprite.x, targetSprite.y, this.scene, targetSprite.parentContainer);
      }))

      const texts = results.map(r => this.createCombatText(
        r.resultingValue.toString(),
        r.target,
        "#92e8a2"
      ));

      await Promise.all(texts.map(t => this.playCombatText(t)));

      results.forEach(r => {
        const message = [
          `${executor.name} uses the ${this.item.name} on ${r.target.name}.  ${r.target.name} is healed for ${r.resultingValue} HP`,
          `${r.target.name} has ${r.target.currentHp} HP out of ${r.target.getMaxHp()} left.`
        ];
        r.message = message;

      })

      State.getInstance().consumeItem(this.item.id);
      return resolve(results);
    });
  }

  public async executeAction(): Promise<CombatResult[]> {
    return new Promise(async resolve => {
      const executor = this.executor;
      const targets = this.confirmTargets();
      let results;
      // This is where we implement our Actions.ts actions.
      if (this.action === CombatActionTypes.useItem) {
        if (!targets.length || !this.executorIsValid()) {
          return resolve(this.returnFailedAction(executor, targets));
        }
        results = await this.handleUseItem(executor, targets);
      }
      return resolve(results);
    });
  }

}