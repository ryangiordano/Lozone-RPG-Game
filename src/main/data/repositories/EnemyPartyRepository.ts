import { Repository } from "./Repository";

export interface CombatEntityData {
  entityId: number,
  position: Coords
}

export interface EnemyPartyData {
  enemies: CombatEntityData[];
}

export class EnemyPartyRepository extends Repository<EnemyPartyData> {
  constructor(game: Phaser.Game) {
    const enemyParties = game.cache.json.get('enemy-parties')
    super(enemyParties);
  }
}
