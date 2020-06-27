import { poisonEnchantment } from "../components/battle/enchantments/poisonEnchantment";
import { regenEnchantment } from "../components/battle/enchantments/regenEnchantment";
import { firebladeEnchantment } from "../components/battle/enchantments/firebladeEnchantment";

export const enchantmentDatabase = {
  "1": {
    type: 2,
    name: "Poison",
    description: "Take damage every turn",
    applyEnchantment: poisonEnchantment,
  },
  "2": {
    type: 2,
    name: "Regen",
    description: "Regenerate small amount of HP every turn",
    applyEnchantment: regenEnchantment,
  },
  "3": {
    type: 1,
    name: "Fireblade",
    description: "Do fire damage after every weapon swing",
    applyEnchantment: firebladeEnchantment,
  },
};
