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

/**
 * Is an object meant to be stored in an array of CombatEvents and then interated
 * over during the course of a turn.
 */
export class CombatEvent {
  private textFactory: TextFactory = new TextFactory();
  constructor(
    public executor: Combatant,
    public target: Combatant,
    public action: CombatActionTypes,
    private orientation: Orientation,
    private scene: Phaser.Scene
  ) {}

  public async executeAction(): Promise<CombatResult> {
    return new Promise(async resolve => {
      const executor = this.executor;
      const target = this.confirmTarget();
      let results;
      // This is where we implement our Actions.ts actions.
      if (this.action === CombatActionTypes.attack) {
        if (!target || !this.executorIsValid) {
          resolve(this.returnFailedAction(executor, target));
        }
        results = await this.handleAttack(executor, target);
      }
      if (this.action === CombatActionTypes.defend) {
        results = await this.handleDefend(executor);
      }
      return resolve(results);
      // TODO: depending on the this.action value, execute a certain command.
    });
    //TODO: broadcast actions to an in battle dialog
  }

  private async handleDefend(executor: Combatant): Promise<any> {
    return new Promise(async resolve => {
      executor.defendSelf();
      const results: CombatResult = {
        actionType: CombatActionTypes.defend,
        executor,
        target: executor,
        resultingValue: 0,
        targetDown: false
      };
      console.log(`${executor.name} is defending`);
      const text = this.createCombatText("^", this.executor);
      await this.playFadeUp(text);
      return resolve(results);
    });
  }

  private async handleAttack(
    executor: Combatant,
    target: Combatant
  ): Promise<any> {
    return new Promise(async resolve => {
      const modifier = this.orientation === Orientation.left ? 1 : -1;
      const results: CombatResult = executor.attackTarget(target);

      await this.playMemberAttack(executor.getSprite(), modifier * 25);
      await this.playMemberTakeDamage(target.getSprite());
      const text = this.createCombatText(
        results.resultingValue.toString(),
        this.target
      );

      await this.playCombatText(text);
      results.message = [
        `${executor.name} attacks ${target.name} for ${results.resultingValue}`,
        `${target.name} has ${target.currentHp} HP out of ${target.maxHp} left.`
      ];

      return resolve(results);
    });
  }

  private returnFailedAction(
    executor: Combatant,
    target: Combatant
  ): CombatResult {
    return executor.failedAction(target);
  }

  private createCombatText(
    value: string,
    combatant: Combatant
  ): Phaser.GameObjects.Text {
    const sprite = combatant.getSprite();
    const container = combatant.getSprite().parentContainer;

    const valueText = this.textFactory.createText(
      value,
      { x: sprite.x, y: sprite.y },
      this.scene,
      "60px",
      { fill: "#ffffff" }
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
  playMemberTakeDamage(partyMember: Phaser.GameObjects.Sprite): Promise<any> {
    return new Promise(resolve => {
      const tween = characterDamage(partyMember, 0.0, this.scene, () => {
        resolve();
      });
      tween.play();
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
  private confirmTarget(): Combatant {
    let target = this.target;
    if (target && target.currentHp <= 0) {
      const nextTargetable = target
        .getParty()
        .members.find(potentialTarget => potentialTarget.currentHp > 0);
      if (nextTargetable) {
        this.target = nextTargetable;
        target = nextTargetable;
      }
    }
    return target;
  }

  private executorIsValid(): boolean {
    return this.executor.currentHp > 0;
  }
}
