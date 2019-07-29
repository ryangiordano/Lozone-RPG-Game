import { State } from "../../utility/state/State";
import { Combat } from "../../components/battle/Combat";
import { EnemyController } from "../../data/controllers/EnemyController";
import { EnemyParty } from "../../components/battle/Party";

export class CombatScene extends Phaser.Scene {
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

    const enemyParty = new EnemyParty(data.enemyPartyId, this.game);

    this.combat = new Combat(this, party.getParty(), enemyParty.getParty());
    this.events.once('end-battle', (battleResults) => {
      this.endBattle();
    });
    this.events.once('game-over', (battleResults) => {
      alert('You have died.')
      //TODO: change scene to game over scene.
    });
  }
  
  private endBattle() {
    this.scene.stop();
    this.scene.manager.wake(this.previousSceneKey);
    this.scene.bringToTop(this.previousSceneKey);
  }

}






