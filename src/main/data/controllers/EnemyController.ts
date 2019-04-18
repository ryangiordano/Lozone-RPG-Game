import { EnemyRepository } from "../repositories/EnemyRepository";
import { EnemyPartyRepository } from "../repositories/EnemyPartyRepository";

export class EnemyController {
  private enemyRepository: EnemyRepository;
  private enemyPartyRepository: EnemyPartyRepository;
  constructor(game: Phaser.Game) {
    this.enemyRepository = new EnemyRepository(game)
    this.enemyPartyRepository = new EnemyPartyRepository(game);
  }
  public getEnemyById(id:number){
    return this.enemyRepository.getById(id);
  }
}
