import { Combatant } from "./Combatant";
import { CombatSprite } from "./combat-grid/CombatSprite";
import { CombatActions, CombatResult, Orientation } from "./Battle";
import { TextFactory } from "../../utility/TextFactory";
import { makeTextScaleUp } from "../../utility/tweens/text";
export class CombatEvent {
  private textFactory: TextFactory = new TextFactory();
  constructor(public executorCombatSprite: CombatSprite, public targetCombatSprite: CombatSprite, public action: CombatActions, private orientation: Orientation, private executorParty: CombatSprite[], private targetParty: CombatSprite[], private scene: Phaser.Scene) {
  }
  public executeAction(): Promise<any> {
    return new Promise((resolve) => {
      const executor = this.executorCombatSprite.getCombatant();
      const target = this.confirmTarget();
      if (!target || !this.executorIsValid) {
        resolve(this.returnFailedAction(executor, target));
      }
      // Needs to be replaced with animations/tweening and callbacks, but it works asynchronously.
      const modifier = this.orientation === Orientation.left ? 1 : -1;
      this.executorCombatSprite.setX(this.executorCombatSprite.x + (15 * modifier));
      setTimeout(() => {
        this.executorCombatSprite.setX(this.executorCombatSprite.x - (15 * modifier));
        setTimeout(() => {
          this.targetCombatSprite.setAlpha(.5);
          setTimeout(() => {
            this.targetCombatSprite.setAlpha(1);
            const results: CombatResult = executor.attackTarget(target);
            console.log(`${executor.name} attacks ${target.name} for ${results.resultingValue}`);
            console.log(`${target.name} has ${target.currentHp} HP out of ${target.hp} left.`);
            this.setCombatText(results.resultingValue.toString()).then(() => {
              return resolve({ targetCombatSprite: this.targetCombatSprite, executorCombatSprite: this.executorCombatSprite, results });
            });
          }, 100);
        }, 500);
      }, 100);
    });
    //TODO: broadcast actions to an in battle dialog 
  }
  private returnFailedAction(executor, target) {
    return {
      targetCombatSprite: this.targetCombatSprite, executorCombatSprite: this.executorCombatSprite,
      results: executor.failedAction(target)
    };
  }
  private setCombatText(value: string) {
    return new Promise((resolve) => {
      const target = this.targetCombatSprite;
      const container = target.parentContainer;
      const valueText = this.textFactory.createText(value, { x: target.x, y: target.y }, this.scene, '15px', { fill: '#ff2b4e' });
      this.scene.add.existing(valueText);
      valueText.setAlpha(0);
      valueText.setScale(.1, .1);
      valueText.setOrigin(.5, .5);
      container.add(valueText);
      const tween = makeTextScaleUp(valueText, 600, this.scene, () => {
        valueText.destroy();
        resolve();
      });
      tween.play(false);
    });
  }
  private confirmTarget(): Combatant {
    let target = this.targetCombatSprite.getCombatant();
    if (target.currentHp <= 0) {
      const nextTargetable = this.targetParty.find(potentialTarget => potentialTarget.getCombatant().currentHp > 0);
      if (nextTargetable) {
        this.targetCombatSprite = nextTargetable;
        target = nextTargetable.getCombatant();
      }
    }
    return target;
  }
  private executorIsValid(): boolean {
    return this.executorCombatSprite.getCombatant().currentHp > 0;
  }
}
