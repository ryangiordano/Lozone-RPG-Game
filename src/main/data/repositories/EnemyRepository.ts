import { Repository } from "./Repository";
import { Enemy } from "../../components/battle/Enemy";


export class EnemyRepository extends Repository<Enemy> {
  constructor(game: Phaser.Game) {
    const enemies = game.cache.json.get('enemies');
    super(enemies);

  }
}
