import { Combatant } from "../Combatant";
import { EnchantmentResult } from "../../../data/repositories/CombatInfluencerRepository";
import { ORANGE } from "../../../utility/Constants";
export const firebladeEnchantment = (
  enchanted: Combatant,
  target: Combatant
): EnchantmentResult => {
  const damage = Math.round(enchanted.getMagicPower() * 0.25);
  target.damageFor(damage);
  return {
    enchantmentType: "damage",
    value: damage,
    color: ORANGE.str,
  };
};
