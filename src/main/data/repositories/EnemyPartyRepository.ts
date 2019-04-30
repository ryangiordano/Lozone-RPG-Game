import { Repository } from "./Repository";
import { EnemyParty } from "../../components/battle/CombatDataStructures";

export class EnemyPartyRepository extends Repository<EnemyParty> {
  constructor(game: Phaser.Game) {
    const enemyParties = game.cache.json.get('enemy-parties')
    super(enemyParties);


  }
}
