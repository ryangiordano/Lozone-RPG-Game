import { EnemyRepository } from "../repositories/EnemyRepository";
import { EnemyPartyRepository } from "../repositories/EnemyPartyRepository";
import { Enemy } from "../../components/battle/Enemy";
import { EnemyParty } from "../../components/battle/Party";

export class EnemyController {
  private enemyRepository: EnemyRepository;
  private enemyPartyRepository: EnemyPartyRepository;
  constructor(game: Phaser.Game) {
    this.enemyRepository = new EnemyRepository(game)
    this.enemyPartyRepository = new EnemyPartyRepository(game);
  }
  public getEnemyById(enemyId: number) {
    const enemyFromDb = this.enemyRepository.getById(enemyId);
    // TODO: create a mapping between the database entitity and the entity you'd like to be transformed into.
    const { id, name, spriteKey, maxHp: hp, maxMp: mp, level, intellect, dexterity, strength, wisdom, stamina, lootTable, experiencePoints, goldValue } = enemyFromDb;
    const enemy = new Enemy(
      id, name, spriteKey, hp, mp, level, intellect, dexterity, strength, wisdom, stamina, lootTable, experiencePoints, goldValue
    );
    return enemy;
  }
  public getEnemyPartyById(enemyPartyId: number): number[] {
    const enemyPartyFromDb = this.enemyPartyRepository.getById(enemyPartyId);
    return enemyPartyFromDb.enemies;
  }
}
