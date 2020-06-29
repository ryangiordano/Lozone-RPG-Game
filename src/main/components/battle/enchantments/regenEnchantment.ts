import { Combatant } from "../Combatant";
import { EnchantmentResult } from "../../../data/repositories/CombatInfluencerRepository";
import { GREEN } from "../../../utility/Constants";
export const regenEnchantment = (enchanted: Combatant): EnchantmentResult => {
  const damageToHeal = 10;
  enchanted.healFor(damageToHeal);
  return {
    enchantmentType: "recovery",
    value: damageToHeal,
    color: GREEN.str,
  };
};
