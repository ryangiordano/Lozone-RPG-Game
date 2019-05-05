import { Combatant } from "./Combatant";
import { CombatActionTypes, CombatResult, Orientation } from "./CombatDataStructures";
import { TextFactory } from "../../utility/TextFactory";
import { makeTextScaleUp } from "../../utility/tweens/text";

export class CombatEvent {
  private textFactory: TextFactory = new TextFactory();
  constructor(
    public executor: Combatant,
    public target: Combatant,
    public action: CombatActionTypes,
    private orientation: Orientation,
    private scene: Phaser.Scene) {
  }

  public executeAction(): Promise<CombatResult> {
    return new Promise((resolve) => {
      const executor = this.executor;
      const target = this.confirmTarget();
      // This is where we implement our Actions.ts actions. 
      if (this.action === CombatActionTypes.attack) {
        
        if (!target || !this.executorIsValid) {
          resolve(this.returnFailedAction(executor, target));
        }
        this.handleAttack(executor, target).then((results) => resolve(results));
      }
      if (this.action === CombatActionTypes.defend) {
        this.handleDefend(executor).then((results) => resolve(results))
      }
      // Needs to be replaced with animations/tweening and callbacks, but it works asynchronously.
      // TODO: depending on the this.action value, execute a certain command.

    });
    //TODO: broadcast actions to an in battle dialog 
  }

  private handleDefend(executor: Combatant): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results: CombatResult = executor.defendSelf();
        console.log(`${executor.name} is defending`);
        const text = this.createCombatText('^', this.executor);
        this.playCombatText(text).then(() => {
          return resolve(results);
        });
      }, 100);
    });
  }

  private handleAttack(executor: Combatant, target: Combatant): Promise<any> {
    return new Promise((resolve) => {
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
            const text = this.createCombatText(results.resultingValue.toString(), this.target);
            this.playCombatText(text).then(() => {
              return resolve(results);
            });
          }, 100);
        }, 500);
      }, 100);
    });
  }

  private returnFailedAction(executor: Combatant, target: Combatant): CombatResult {
    return executor.failedAction(target);
  }

  private createCombatText(value: string, combatant: Combatant): Phaser.GameObjects.Text {
    const sprite = combatant.getSprite();
    const container = combatant.getSprite().parentContainer;

    const valueText = this.textFactory.createText(value, { x: sprite.x, y: sprite.y }, this.scene, '15px', { fill: '#ff2b4e' });

    this.scene.add.existing(valueText);
    valueText.setAlpha(0);
    valueText.setScale(.1, .1);
    valueText.setOrigin(.5, .5);

    container.add(valueText);

    return valueText;
  }

  public playCombatText(textObject: Phaser.GameObjects.Text): Promise<any> {

    return new Promise((resolve) => {
      const tween = makeTextScaleUp(textObject, 600, this.scene, () => {
        textObject.destroy();
        resolve();
      });
      tween.play(false);
    });
  }
  private confirmTarget(): Combatant {
    let target = this.target;
    if (target && target.currentHp <= 0) {
      const nextTargetable = target.getParty()
        .members
        .find(potentialTarget => potentialTarget.currentHp > 0);
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
