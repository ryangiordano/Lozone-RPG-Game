// Three classes for interacting with the data stored in
import { Repository } from "./Repository";
import { Buff } from "../../components/battle/Buff";
import { Modifier } from "../../components/battle/CombatDataStructures";

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
