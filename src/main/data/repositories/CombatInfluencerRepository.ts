// Three classes for interacting with the data stored in
import { Repository } from "./Repository";
import { Buff } from "../../components/battle/Buff";
import { Modifier } from "../../components/battle/CombatDataStructures";
import { enchantmentDatabase } from "../enchantments";
import { Combatant } from "../../components/battle/Combatant";

export class BuffRepository extends Repository<Buff> {
  constructor(game) {
    const dialog = game.cache.json.get("buffs");
    super(dialog);
  }
}

export class ModifierRepository extends Repository<Modifier> {
  constructor(game) {
    const dialog = game.cache.json.get("modifiers");
    super(dialog);
  }
}

export interface EnchantmentResult {
  enchantmentType: "recovery" | "damage" | "other";
  value: number;
  color: string;
}

export interface Enchantment {
  id: number;
  name: string;
  description: string;
  type: EnchantmentResolveType;
  applyEnchantment: (enchanted: Combatant) => EnchantmentResult;
}

export enum EnchantmentResolveType {
  preAttack,
  postAttack,
  postTurn,
}

export class EnchantmentRepository extends Repository<Enchantment> {
  constructor(game: Phaser.Game) {
    const enchantments = enchantmentDatabase;
    super(enchantments);
  }
  /** Get an enchantment from the database and allow the consumer to execute it */
  makeEnchantment() {}
}
