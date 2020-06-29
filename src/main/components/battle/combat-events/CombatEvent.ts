import { Combatant } from "../Combatant";
import {
  CombatActionTypes,
  CombatResult,
  Orientation,
} from "../CombatDataStructures";
import { TextFactory } from "../../../utility/TextFactory";
import {
  textScaleUp,
  slowScaleUp,
  playCombatText,
} from "../../../utility/tweens/text";
import {
  characterAttack,
  characterDamage,
} from "../../../utility/tweens/character";
import { EffectsRepository } from "../../../data/repositories/EffectRepository";
import { WHITE, YELLOW } from "../../../utility/Constants";

//TODO: Refactor this to take care of less stuff.  It does too much;
/**
 * Is an object meant to be stored in an array of CombatEvents and then interated
 * over during the course of a turn.
 */
export class CombatEvent {
  //TODO: Abstract this out to be different classes inheriting from CombatEvent;
  private effectsRepository: EffectsRepository;
  protected textFactory: TextFactory;
  constructor(
    public executor: Combatant,
    public targets: Combatant[],
    public type: CombatActionTypes,
    protected orientation: Orientation,
    protected scene: Phaser.Scene
  ) {
    this.textFactory = new TextFactory(scene);
    this.effectsRepository = new EffectsRepository(this.scene.game);
  }

  public async executeAction(): Promise<CombatResult[]> {
    return new Promise(async (resolve) => {
      const executor = this.executor;
      const targets = this.confirmTargets();
      let results;
      // This is where we implement our Actions.ts actions.
      if (this.type === CombatActionTypes.attack) {
        if (!targets.length || !this.executorIsValid()) {
          return resolve(this.returnFailedAction(executor, targets));
        }
        results = await this.handleAttack(executor, targets);
      }
      if (this.type === CombatActionTypes.defend) {
        results = await this.handleDefend(executor);
      }
      return resolve(results);
    });
  }

  protected async handleDefend(executor: Combatant): Promise<any> {
    return new Promise(async (resolve) => {
      executor.defendSelf();
      const results: CombatResult[] = [
        {
          actionType: CombatActionTypes.defend,
          executor,
          target: executor,
          resultingValue: 0,
          targetDown: false,
        },
      ];
      //TODO: Play effect here for defending
      // const text = this.createCombatText("^", this.executor);
      // await this.playFadeUp(text);
      results[0].message = [`${this.executor.name} is defending.`];
      return resolve(results);
    });
  }

  protected async handleAttack(
    executor: Combatant,
    targets: Combatant[]
  ): Promise<any> {
    return new Promise(async (resolve) => {
      const distanceModifier = this.orientation === Orientation.left ? 1 : -1;
      const results: CombatResult[] = executor.attackTarget(targets);
      await this.playMemberAttack(executor.getSprite(), distanceModifier * 25);
      await Promise.all(
        results.map((t) =>
          this.playCombatantTakeDamage(t.target.getSprite(), t.critical)
        )
      );
      const texts = results.map((r) =>
        this.createCombatText(
          r.resultingValue.toString(),
          r.target,
          r.critical ? YELLOW.str : WHITE.str,
          r.critical ? 80 : 60
        )
      );
      await Promise.all(texts.map((t) => playCombatText(t, this.scene)));
      results.forEach((r) => {
        r.message = [
          `${executor.name} attacks ${r.target.name} for ${r.resultingValue}`,
          `${r.target.name} has ${
            r.target.currentHp
          } HP out of ${r.target.getMaxHp()} left.`,
        ];
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
    color: string = WHITE.str,
    size: number = 60
  ): Phaser.GameObjects.Text {
    const sprite = combatant.getSprite();
    const container = combatant.getSprite().parentContainer;
    const valueText = this.textFactory.createText(
      value,
      { x: sprite.x, y: sprite.y },
      `${size}px`,
      { fill: color }
    );

    this.scene.add.existing(valueText);
    container.add(valueText);

    return valueText;
  }

  /**
   * Plays the animation for attacking
   * @param partyMember
   * @param distance
   */
  public playMemberAttack(partyMember, distance): Promise<any> {
    return new Promise((resolve) => {
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

  playCombatantTakeDamage(
    combatant: Phaser.GameObjects.Sprite,
    isCritical?: boolean
  ): Promise<any> {
    return new Promise((resolve) => {
      const tween = characterDamage(combatant, 0.0, this.scene, () => {
        resolve();
      });
      tween.play();
      const hitEffect = isCritical
        ? this.effectsRepository.getById(8)
        : this.effectsRepository.getById(3);
      hitEffect.play(
        combatant.x,
        combatant.y,
        this.scene,
        combatant.parentContainer
      );
    });
  }

  playFadeUp(sprite): Promise<any> {
    return new Promise((resolve) => {
      const tween = slowScaleUp(sprite, this.scene, () => {
        resolve();
      });
      tween.play();
    });
  }

  protected confirmTargets(targetOverride = false): Combatant[] {
    if (this.targets.length > 1) {
      // Multiple targets
      this.targets = this.targets.filter((t) => t.currentHp > 0);
    } else {
      // Single target
      if (targetOverride && this.targets[0]) {
        this.targets = [this.targets[0]];
        return this.targets;
      }
      if (this.targets[0] && this.targets[0].currentHp <= 0) {
        const nextTargetable = this.targets[0]
          .getParty()
          .members.find(
            (potentialTarget) => potentialTarget.entity.currentHp > 0
          );
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
