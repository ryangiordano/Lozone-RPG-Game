import { CombatEvent } from "./CombatEvent";
import { Combatant } from "../Combatant";
import {
  CombatActionTypes,
  Orientation,
  CombatResult,
} from "../CombatDataStructures";
import { Item, handleItemUse } from "../../entities/Items/Item";
import { State } from "../../../utility/state/State";
import { SpellType } from "../../../data/repositories/SpellRepository";
import { playCombatText } from "../../../utility/tweens/text";
import { GREEN } from "../../../utility/Constants";

export class UseItemEvent extends CombatEvent {
  /**
   * Handles the case when a player chooses to use an item during battle.
   */
  constructor(
    executor: Combatant,
    targets: Combatant[],
    type: CombatActionTypes,
    orientation: Orientation,
    scene: Phaser.Scene,
    private item: Item
  ) {
    super(executor, targets, type, orientation, scene);
  }

  /**
   * Handles the case when an item is used.
   * @param executor
   * @param target
   */
  protected async handleUseItem(
    executor: Combatant,
    targets: Combatant[]
  ): Promise<any> {
    return new Promise(async (resolve) => {
      const results: CombatResult[] = targets[0].applyItem(this.item);

      await Promise.all(
        targets.map(async (t) => {
          const targetSprite = t.getSprite();
          await this.item.effect.animationEffect.play(
            targetSprite.x,
            targetSprite.y,
            this.scene,
            targetSprite.parentContainer
          );
        })
      );

      const { resource } = handleItemUse(targets[0], this.item);

      const texts = results.map((r) =>
        this.createCombatText(r.resultingValue.toString(), r.target, GREEN.str)
      );

      await Promise.all(texts.map((t) => playCombatText(t, this.scene)));

      results.forEach((r) => {
        const message = [
          `${executor.name} uses the ${this.item.name} on ${r.target.name}.  ${r.target.name} restores ${r.resultingValue} ${resource}`,
        ];
        r.message = message;
      });

      State.getInstance().consumeItem(this.item.id);
      return resolve(results);
    });
  }

  public async executeAction(): Promise<CombatResult[]> {
    return new Promise(async (resolve) => {
      const executor = this.executor;
      const targetOverride = this.item.effect.type === SpellType.revive;
      const targets = this.confirmTargets(targetOverride);
      let results;
      // This is where we implement our Actions.ts actions.
      if (this.type === CombatActionTypes.useItem) {
        if (!targets.length || !this.executorIsValid()) {
          return resolve(this.returnFailedAction(executor, targets));
        }
        results = await this.handleUseItem(executor, targets);
      }
      return resolve(results);
    });
  }
}
