import { makeFadeOut } from "./../../../utility/tweens/fade";
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
import { EffectsRepository } from "../../../data/repositories/EffectRepository";
import { makeFadeIn } from "../../../utility/tweens/fade";
import { asyncForEach, wait } from "../../../utility/Utility";

export class SpellCastEvent extends CombatEvent {
  private effectRepo: EffectsRepository;
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
    this.effectRepo = new EffectsRepository(scene.game);
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

      await this.playCastingAnimation(executor.getSprite());

      /** Play main animation */
      if (this.spell.primaryAnimationEffect) {
        await this.spell.primaryAnimationEffect.play(
          targets[0].getSprite().x,
          targets[0].getSprite().y,
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
          color = GREEN.str;
          break;
        case SpellType.attack:
          color = WHITE.str;
          break;
        case SpellType.manaRecover:
          color = BLUE.str;
          break;
        default:
          color = WHITE.str;
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
      const messages = results.reduce((acc, r) => {
        if (r.message) {
          acc.push(r.message);
        }
        return acc;
      }, []);

      await asyncForEach(messages, async (message) => {
        await wait(200);
        return await displayMessage(message, this.scene.game, this.scene.scene);
      });

      return resolve(results);
    });
  }

  private playCastingAnimation(sprite: Phaser.GameObjects.Sprite) {
    return new Promise(async (resolve) => {
      /** Play casting anim */
      const e = this.effectRepo.getById(12);
      sprite.setFrame(10);
      const wave = this.scene.add.sprite(
        sprite.x,
        sprite.y + 12,
        "ground-wave"
      );
      wave.on("animationcomplete", () => {
        wave.destroy();
      });
      sprite.parentContainer.add(wave);
      sprite.parentContainer.sendToBack(wave);
      wave.anims.play("ground-wave");

      await e.play(sprite.x, sprite.y, this.scene, sprite.parentContainer);
      sprite.setFrame(6);

      resolve();
    });
  }

  protected async handleMultiSpellCast(executor: Combatant) {}

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
