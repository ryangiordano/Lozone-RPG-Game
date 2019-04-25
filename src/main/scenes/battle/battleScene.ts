import { State } from "../../utility/state/State";
import { Combat } from "../../components/battle/Combat";
import { EnemyController } from "../../data/controllers/EnemyController";

export class BattleScene extends Phaser.Scene {
  private previousSceneKey: string;
  private enemyController: EnemyController;
  private combat: Combat;
  constructor() {
    super('Battle');

  }
  init(data) {
    this.enemyController = new EnemyController(this.game);
    this.previousSceneKey = data.key;
    this.add.image(0, 0, 'dungeon_battle_background').setOrigin(0, 0).setScale(.5, .5);

    const party = State.getInstance().getCurrentParty();

    const enemyParty = this.enemyController.getEnemyPartyById(data.enemyPartyId);

    this.combat = new Combat(this, party.getParty(), enemyParty);
    
    this.events.once('end-battle', (battleResults) => {
      console.log(battleResults)
      this.endBattle();
    });
  }

  private endBattle() {
    this.scene.stop();
    this.scene.manager.wake(this.previousSceneKey);
    this.scene.bringToTop(this.previousSceneKey);
  }

}






