import { Explore } from "./exploreScene";
import { EnemyController } from "../data/controllers/EnemyController";
import { Enemy } from "../components/battle/Enemy";

const createRandom = (upTo) => () => Math.ceil(Math.random() * upTo);

export class DungeonScene extends Explore {
  private enemyParties: Enemy[][] = [];
  private enemyController: EnemyController;
  private rollEncounter = createRandom(10);
  constructor() {
    super('Dungeon');

  }
  afterInit(data) {
    this.enemyController = new EnemyController(this.game);
    data.enemyParties.forEach(partyId => {
      const enemyParty = this.enemyController.getEnemyPartyById(partyId)
      this.enemyParties.push(enemyParty);
    });
  }
  afterCreated() {
    this.player.on('finished-movement', () => {
      const random = this.rollEncounter();
      if (random === 10) {
        const randomEnemyParty = this.enemyParties[Math.floor(Math.random() * this.enemyParties.length)];
        this.input.keyboard.resetKeys();
        this.scene.manager.sleep(this.scene.key);
        this.scene.run('Battle', { key: this.scene.key, enemies: randomEnemyParty })
      }

    });


  }
  private chooseEnemyAtRandom() {

  }
}