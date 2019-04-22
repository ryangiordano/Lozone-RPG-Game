import { StateManager } from "../utility/state/StateManager";
import { CombatContainer } from "../components/battle/combat-grid/CombatContainer";
import { UserInterface } from "../components/UI/UserInterface";
import { CombatSprite } from "../components/battle/combat-grid/CombatSprite";
import { CombatResult, CombatActions } from "../components/battle/Battle";
import { Party } from "../components/battle/Party";
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
    this.combatManager.addAndPopulateContainers(data.enemies, party.getParty());

    this.combatManager.createUI();

    this.events.on('loop-finished', () => {
      //reactivate the UI. Resetart input loop
      console.log("Round over, reset pedning inputs")
    });
    this.events.on('end-battle', () => {
      //reactivate the UI. Resetart input loop
      this.endBattle();
      console.log("Round over, reset pedning inputs")
    });

    this.combatManager.resetParty();


  }


  private endBattle() {
    this.scene.stop();
    this.scene.manager.wake(this.previousSceneKey);
    this.scene.bringToTop(this.previousSceneKey);
  }

}






