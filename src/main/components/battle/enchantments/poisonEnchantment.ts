import { Combatant } from "../Combatant";
import { EnchantmentResult } from "../../../data/repositories/CombatInfluencerRepository";
import { PURPLE } from "../../../utility/Constants";
export const poisonEnchantment = (enchanted: Combatant): EnchantmentResult => {
  const damageToDeal = Math.round(enchanted.maxHp / 5);
  enchanted.damageFor(damageToDeal);
  return {
    enchantmentType: "damage",
    value: damageToDeal,
    color: PURPLE.str,
    affected: [enchanted],
  };
};
