import { EnemyRepository } from "../repositories/EnemyRepository";
import { EnemyPartyRepository } from "../repositories/EnemyPartyRepository";
import { Enemy } from "../../components/battle/Enemy";
import { IEntityParty } from "../../components/battle/CombatDataStructures";

export interface CombatEntityData {
  entityId: number,
}
export class EnemyController {
  private enemyRepository: EnemyRepository;
  private enemyPartyRepository: EnemyPartyRepository;
  constructor(game: Phaser.Game) {
    this.enemyRepository = new EnemyRepository(game);
    this.enemyPartyRepository = new EnemyPartyRepository(game);
  }
  public getEnemyById(enemyId: number) {
    const enemyFromDb = this.enemyRepository.getById(enemyId);
    const {
      id,
      name,
      spriteKey,
      maxHp: hp,
      maxMp: mp,
      level,
      intellect,
      dexterity,
      strength,
      wisdom,
      stamina,
      lootTable,
      experiencePoints,
      goldValue,
      physicalResist,
      magicalResist,
      flagsWhenDefeated
    } = enemyFromDb;
    const enemy = new Enemy(
      id,
      name,
      spriteKey,
      hp,
      mp,
      level,
      intellect,
      dexterity,
      strength,
      wisdom,
      stamina,
      lootTable,
      experiencePoints,
      goldValue,
      physicalResist,
      magicalResist,
      flagsWhenDefeated
    );
    return enemy;
  }
  public getEnemyPartyById(enemyPartyId: number): IEntityParty {
    const enemyPartyFromDb = this.enemyPartyRepository.getById(enemyPartyId);
    return {
      entities: enemyPartyFromDb.entities.map(enemyData => (
        {
          entity: this.getEnemyById(enemyData.entityId),
          position: enemyData.position
        }
      ))
    }
  }
}
