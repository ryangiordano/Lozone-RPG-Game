import { Repository } from "./Repository";
import { Effect } from "../../components/battle/CombatDataStructures";
import { Flag } from "../../utility/state/FlagModule";

export class FlagRepository extends Repository<Flag> {
  constructor(game: Phaser.Game) {
    const flags = game.cache.json.get('flags');
    super(flags);
  }
}
