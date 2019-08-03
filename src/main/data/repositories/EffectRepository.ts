import { Repository } from "./Repository";
import { Effect } from "../../components/battle/CombatDataStructures";

export class EffectsRepository extends Repository<Effect> {
  constructor(game: Phaser.Game) {
    const effects = game.cache.json.get('effects')
    super(effects);
  }
}
