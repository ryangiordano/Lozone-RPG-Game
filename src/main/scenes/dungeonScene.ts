import { Explore } from "./exploreScene";
import { EnemyController } from "../data/controllers/EnemyController";
import { Enemy } from "../components/battle/Enemy";

export class DungeonScene extends Explore {
  private enemyParties:Enemy[][] =[];
  private enemyController: EnemyController;
  constructor() {
    super('Dungeon');

  }
  afterInit(data){
    this.enemyController = new EnemyController(this.game);
    data.enemyParties.forEach(partyId=>{
      const enemyParty = this.enemyController.getEnemyPartyById(partyId)
      this.enemyParties.push(enemyParty);
    });
  }
  afterCreated() {

    this.player.on('finished-movement', () => {
      const random = Math.floor(Math.random() * 20);
      if (random === 10) {
        setTimeout(() => {
          const randomEnemyParty = this.enemyParties[Math.floor(Math.random() * this.enemyParties.length)];
          this.input.keyboard.resetKeys();
          this.scene.manager.sleep(this.scene.key);
          this.scene.run('Battle', { key: this.scene.key, enemies: randomEnemyParty})
        }, 500)
      }

    });


  }
  private chooseEnemyAtRandom(){

  }
}