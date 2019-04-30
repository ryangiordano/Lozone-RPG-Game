import { Combatant } from "./Combatant";
import { CombatSprite } from "./combat-grid/CombatSprite";
import { CombatActions, CombatResult, Orientation } from "./Battle";
import { TextFactory } from "../../utility/TextFactory";
import { makeTextScaleUp } from "../../utility/tweens/text";
export class CombatEvent {
  private textFactory: TextFactory = new TextFactory();
  constructor(
    public executor: Combatant,
    public target: Combatant,
    public action: CombatActions,
    private orientation: Orientation,
    private scene: Phaser.Scene) {
  }
  public executeAction(): Promise<any> {
    return new Promise((resolve) => {
      const executor = this.executor;
      const target = this.confirmTarget();

      if (!target || !this.executorIsValid) {
        resolve(this.returnFailedAction(executor, target));
      }

      // Needs to be replaced with animations/tweening and callbacks, but it works asynchronously.
      const modifier = this.orientation === Orientation.left ? 1 : -1;
      this.executor.setX(this.executor.getSprite().x + (15 * modifier));
      setTimeout(() => {
        this.executor.setX(this.executor.getSprite().x - (15 * modifier));
        setTimeout(() => {
          this.target.getSprite().setAlpha(.5);
          setTimeout(() => {
            this.target.getSprite().setAlpha(1);
            const results: CombatResult = executor.attackTarget(target);
            console.log(`${executor.name} attacks ${target.name} for ${results.resultingValue}`);
            console.log(`${target.name} has ${target.currentHp} HP out of ${target.maxHp} left.`);
            this.setCombatText(results.resultingValue.toString()).then(() => {
              return resolve({
                target: this.target,
                executor: this.executor, results
              });
            });
          }, 100);
        }, 500);
      }, 100);
    });
    //TODO: broadcast actions to an in battle dialog 
  }
  private returnFailedAction(executor, target) {
    return {
      targetCombatSprite: this.target, executorCombatSprite: this.executor,
      results: executor.failedAction(target)
    };
  }
  private setCombatText(value: string) {
    return new Promise((resolve) => {
      const target = this.target;
      const container = target.getSprite().parentContainer;
      const valueText = this.textFactory.createText(value, { x: target.getSprite().x, y: target.getSprite().y }, this.scene, '15px', { fill: '#ff2b4e' });
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
    let target = this.target;
    if (target.currentHp <= 0) {
      const nextTargetable = target.getParty().find(potentialTarget => potentialTarget.currentHp > 0);
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
