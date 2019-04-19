import { EnemyRepository } from "../repositories/EnemyRepository";
import { EnemyPartyRepository } from "../repositories/EnemyPartyRepository";
import { Enemy } from "../../components/battle/Enemy";

export class EnemyController {
  private enemyRepository: EnemyRepository;
  private enemyPartyRepository: EnemyPartyRepository;
  constructor(game: Phaser.Game) {
    this.enemyRepository = new EnemyRepository(game)
    this.enemyPartyRepository = new EnemyPartyRepository(game);
  }
  public getEnemyById(id: number) {
    return this.enemyRepository.getById(id);
  }
  public getEnemyPartyById(id: number): Enemy[] {
    const party = this.enemyPartyRepository.getById(id);
    const populatedParty = party.enemies.map(enemyId => this.enemyRepository.getById(enemyId));
    return populatedParty;
  }
}
