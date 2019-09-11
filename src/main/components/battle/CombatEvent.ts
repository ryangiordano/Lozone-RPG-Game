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
    public target: Combatant,
    public action: CombatActionTypes,
    protected orientation: Orientation,
    protected scene: Phaser.Scene
  ) {
    this.textFactory = new TextFactory(scene);
    this.effectsRepository = new EffectsRepository(this.scene.game);
  }

  public async executeAction(): Promise<CombatResult> {
    return new Promise(async resolve => {
      const executor = this.executor;
      const target = this.confirmTarget();
      let results;
      // This is where we implement our Actions.ts actions.
      if (this.action === CombatActionTypes.attack) {
        if (!target || !this.executorIsValid()) {
          return resolve(this.returnFailedAction(executor, target));
        }
        results = await this.handleAttack(executor, target);
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
    target: Combatant
  ): Promise<any> {
    return new Promise(async resolve => {
      const modifier = this.orientation === Orientation.left ? 1 : -1;
      const results: CombatResult = executor.attackTarget(target);
      await this.playMemberAttack(executor.getSprite(), modifier * 25);
      await this.playCombatantTakeDamage(target.getSprite());
      const text = this.createCombatText(
        results.resultingValue.toString(),
        this.target
      );

      await this.playCombatText(text);
      const message = [
        `${executor.name} attacks ${target.name} for ${results.resultingValue}`,
        `${target.name} has ${target.currentHp} HP out of ${target.getMaxHp()} left.`
      ];

      results.message = message;
      return resolve(results);
    });
  }


  protected returnFailedAction(
    executor: Combatant,
    target: Combatant
  ): CombatResult {
    return executor.failedAction(target);
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
      hitEffect.animationEffect(combatant.x, combatant.y, this.scene, combatant.parentContainer);

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

  protected confirmTarget(): Combatant {
    let target = this.target;
    if (target && target.currentHp <= 0) {
      const nextTargetable = target
        .getParty()
        .members.find(potentialTarget => potentialTarget.entity.currentHp > 0);
      if (nextTargetable) {
        this.target = nextTargetable.entity;
        target = nextTargetable.entity;
      }
    }
    return target;
  }

  protected executorIsValid(): boolean {
    return this.executor.currentHp > 0;
  }
}


export class UseItemEvent extends CombatEvent {
  /**
   * Handles the case when a player chooses to use an item during battle.
   */
  public type: CombatActionTypes = CombatActionTypes.useItem;
  constructor(
    executor: Combatant,
    target: Combatant,
    action: CombatActionTypes,
    orientation: Orientation,
    scene: Phaser.Scene,
    private item: Item,
  ) {
    super(executor, target, action, orientation, scene)
  }

  /**
   * Handles the case when an item is used.
   * @param executor 
   * @param target 
   */
  protected async handleUseItem(executor: Combatant, target: Combatant): Promise<any> {
    return new Promise(async resolve => {
      const results: CombatResult = target.applyItem(this.item)
      const targetSprite = target.getSprite();
      //TODO: Clean this up because it sucks.
      await this.item.effect.animationEffect.animationEffect(targetSprite.x, targetSprite.y, this.scene, targetSprite.parentContainer)

      const text = this.createCombatText(
        results.resultingValue.toString(),
        this.target,
        "#92e8a2"
      );
      await this.playCombatText(text);
      const message = [
        `${executor.name} uses the ${this.item.name} on ${target.name}.  ${target.name} is healed for ${results.resultingValue} HP`,
        `${target.name} has ${target.currentHp} HP out of ${target.getMaxHp()} left.`
      ];
      results.message = message;
      State.getInstance().consumeItem(this.item.id);
      return resolve(results);
    });
  }
  public async executeAction(): Promise<CombatResult> {
    return new Promise(async resolve => {
      const executor = this.executor;
      const target = this.confirmTarget();
      let results;
      // This is where we implement our Actions.ts actions.
      if (this.action === CombatActionTypes.useItem) {
        if (!target || !this.executorIsValid()) {
          return resolve(this.returnFailedAction(executor, target));
        }
        results = await this.handleUseItem(executor, target);
      }
      return resolve(results);
    });
  }
  
}