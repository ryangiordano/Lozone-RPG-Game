import { StateManager } from "../utility/state/StateManager";
import { CombatManager } from "../components/battle/CombatManager";

export class BattleScene extends Phaser.Scene {
  private previousSceneKey: string;
  private combatManager: CombatManager;
  constructor() {
    super('Battle');
  }
  init(data) {

    this.previousSceneKey = data.key;
    this.add.image(0, 0, 'dungeon_battle_background').setOrigin(0, 0).setScale(.5, .5);

    const party = StateManager.getInstance().getCurrentParty();
    this.combatManager = new CombatManager(this, party.getParty(), data.enemies);
    this.combatManager.addAndPopulateContainers();

    this.combatManager.constructInputUI();

    this.events.on('end-battle', () => {
      this.endBattle();
    });

  }


  private endBattle() {
    this.scene.stop();
    this.scene.manager.wake(this.previousSceneKey);
    this.scene.bringToTop(this.previousSceneKey);
  }

}






