import { poisonEnchantment } from "../components/battle/enchantments/poisonEnchantment";
import { regenEnchantment } from "../components/battle/enchantments/regenEnchantment";

export const enchantmentDatabase = {
  "1": {
    id: 1,
    type: 2,
    name: "Poison",
    description: "Take damage every turn",
    applyEnchantment: poisonEnchantment,
  },
  "2": {
    id: 1,
    type: 2,
    name: "Regen",
    description: "Regenerate small amount of HP every turn",
    applyEnchantment: regenEnchantment,
  },
};
