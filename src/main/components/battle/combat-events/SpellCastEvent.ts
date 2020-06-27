import { CombatEvent } from "./CombatEvent";
import { Combatant } from "../Combatant";
import {
  CombatActionTypes,
  Orientation,
  Spell,
  CombatResult,
} from "../CombatDataStructures";
import { SpellType } from "../../../data/repositories/SpellRepository";
import { playCombatText } from "../../../utility/tweens/text";
import { GREEN, WHITE, BLUE } from "../../../utility/Constants";
import { displayMessage } from "../../../scenes/dialogScene";

export class SpellCastEvent extends CombatEvent {
  /**
   * Handles the case when a player chooses to use a spell.
   */
  constructor(
    executor: Combatant,
    targets: Combatant[],
    type: CombatActionTypes,
    orientation: Orientation,
    scene: Phaser.Scene,
    private spell: Spell
  ) {
    super(executor, targets, type, orientation, scene);
  }
  /**
   * Handles the case when a spell is cast.
   * @param executor
   * @param target
   */
  protected async handleSpellCast(
    executor: Combatant,
    targets: Combatant[]
  ): Promise<any> {
    return new Promise(async (resolve) => {
      //TODO: Handle offensive or assistive magic here;
      // Handle mana check.  Lower mana here, NOT in executor.castSpell.  Otherwise, we use mana on every iteration.

      const results: CombatResult[] = executor.castSpell(this.spell, targets);

      // If there were any failures
      const allFailed = results.reduce(
        (acc, r) => (acc = r.actionType === CombatActionTypes.failure),
        false
      );
      if (allFailed) {
        results.forEach((r) => {
          const message = [
            `${executor.name} failed to cast ${this.spell.name}`,
          ];
          r.message = message;
        });
        return resolve(results);
      }

      /** Play main animation */
      if (this.spell.primaryAnimationEffect) {
        await this.spell.primaryAnimationEffect.play(
          0,
          0,
          this.scene,
          targets[0].getSprite().parentContainer
        );
      }

      /** Play individual animations on each affected*/
      await Promise.all(
        results.map((r) => {
          const targetSprite = r.target.getSprite();
          return this.spell.animationEffect.play(
            targetSprite.x,
            targetSprite.y,
            this.scene,
            targetSprite.parentContainer
          );
        })
      );
      
      let color;
      switch (this.spell.type) {
        case SpellType.restoration:
          color = GREEN;
          break;
        case SpellType.attack:
          color = WHITE;
          break;
        case SpellType.manaRecover:
          color = BLUE;
          break;
        default:
          color = WHITE;
      }
      const texts = results.reduce((acc, r) => {
        if (r.resultingValue) {
          acc.push(
            this.createCombatText(r.resultingValue.toString(), r.target, color)
          );
        }
        return acc;
      }, []);

      await Promise.all(texts.map((t) => playCombatText(t, this.scene)));
      results.forEach(async (r) => {
        if (r.message) {
          await displayMessage(r.message, this.scene.game, this.scene.scene);
        }
      });

      return resolve(results);
    });
  }

  protected async handleMultiSpellCast(executor: Combatant) { }

  public async executeAction(): Promise<CombatResult[]> {
    return new Promise(async (resolve) => {
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
