import { CombatResult } from "./../CombatDataStructures";
import { CombatEvent } from "./CombatEvent";
import { CombatActionTypes, Orientation } from "../CombatDataStructures";
import { Combatant } from "../Combatant";
import { Enchantment } from "../../../data/repositories/CombatInfluencerRepository";
import { playCombatText } from "../../../utility/tweens/text";
//TODO: This
export class BuffEvent extends CombatEvent {
  constructor(
    enchanted: Combatant,
    orientation: Orientation,
    scene: Phaser.Scene
  ) {
    super(enchanted, null, null, orientation, scene);
  }
}

/** For regen spells and poison spells */
export class PostTurnEnchantment extends CombatEvent {
  constructor(
    private enchanted: Combatant,
    private enchantment: Enchantment,
    orientation: Orientation,
    scene: Phaser.Scene
  ) {
    super(enchanted, null, null, orientation, scene);
  }
  public async executeAction(): Promise<CombatResult[]> {
    return new Promise(async (resolve) => {
      const result = this.enchantment.applyEnchantment(this.enchanted);
      const text = this.createCombatText(
        result.value.toString(),
        this.enchanted,
        result.color,
        60
      );
      await playCombatText(text, this.scene);
      return resolve([
        {
          actionType: CombatActionTypes.enchantment,
          executor: null,
          target: this.enchanted,
          resultingValue: result.value,
          targetDown: this.enchanted.currentHp <= 0,
          message: [],
        },
      ]);
    });
  }
}

// PostAttackEnchantment

// PreTurnEnchantment
