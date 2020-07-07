import { poisonEnchantment } from "../components/battle/enchantments/poisonEnchantment";
import { regenEnchantment } from "../components/battle/enchantments/regenEnchantment";
import { firebladeEnchantment } from "../components/battle/enchantments/firebladeEnchantment";
import { bladestormEnchantment } from "../components/battle/enchantments/bladestormEnchantment";
import { gentleBladeEnchantment } from '../components/battle/enchantments/gentleBladeEnchantment';

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
  "4": {
    type: 1,
    name: "Bladestorm",
    description: "Attack all enemies after attacking a single enemy",
    applyEnchantment: bladestormEnchantment,
  },
  "5": {
    type: 1,
    name: "Gentle Blade",
    description: "Heal all allies after attacking a single enemy",
    applyEnchantment: gentleBladeEnchantment,
  },
};
