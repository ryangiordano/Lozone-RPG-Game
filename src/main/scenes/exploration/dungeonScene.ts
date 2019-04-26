import { Explore } from "./exploreScene";
import { createRandom, getRandomFloor } from "../../utility/Utility";

export class DungeonScene extends Explore {
  private enemyPartyIds: number[] = [];
  private rollEncounter = createRandom(10);
  constructor() {
    super('Dungeon');
  }
  afterInit(data) {
    this.enemyPartyIds = data.enemyPartyIds;
  }
  afterCreated() {
    this.player.on('finished-movement', () => {
      const random = this.rollEncounter();
      if (random === 10) {
        this.startRandomEncounter(this.chooseEnemyAtRandom());
      }
    });
  }

  private chooseEnemyAtRandom(): number {
    return this.enemyPartyIds[getRandomFloor(this.enemyPartyIds.length)]
  }

  private startRandomEncounter(enemyPartyId: number) {
    this.input.keyboard.resetKeys();
    this.scene.manager.sleep(this.scene.key);
    this.scene.run('Battle', { key: this.scene.key, enemyPartyId })
  }
}