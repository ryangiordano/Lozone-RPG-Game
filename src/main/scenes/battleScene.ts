import { EnemyController } from "../data/controllers/EnemyController";
import { StateManager } from "../utility/state/StateManager";
import { Enemy } from "../components/battle/Enemy";
import { Party } from "../components/battle/Party";
import { Combatant } from "../components/battle/Combatant";

export class BattleScene extends Phaser.Scene {
  private partyContainer: Phaser.GameObjects.Container;
  private enemyContainer: Phaser.GameObjects.Container;
  private enemyController: EnemyController;
  constructor() {
    super('Battle');
  }
  init(data) {
    const sm = StateManager.getInstance();
    const party = sm.getCurrentParty();
    this.enemyController = new EnemyController(this.game);
    this.add.image(0, 0, 'dungeon_battle_background').setOrigin(0, 0).setScale(.5, .5);
    const enemies = data.enemies;
    this.partyContainer = new CombatContainer({x:0 * 16, y:4 * 16}, this,party.getParty());
    this.enemyContainer = new CombatContainer({x:6 * 16, y:4 * 16}, this,enemies);


    this.add.existing(this.partyContainer);
    this.add.existing(this.enemyContainer);
    // DEBUG
    this.input.keyboard.on('keydown', event => {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ESC) {
        this.scene.stop();
        this.scene.manager.wake(data.key);
        this.scene.bringToTop(data.key)
      }
    });
    // DEBUG
  }
  private populateParty(party: Combatant[]) {
    party.forEach(partyMember => {
      const combatSprite = new CombatSprite(this, 0, 0, partyMember);
      this.partyContainer.add(combatSprite)

    })
  }
}

class CombatSprite extends Phaser.GameObjects.Sprite {
  private combatant: Combatant;
  constructor(scene, x, y, combatant) {
    super(scene, x, y, combatant.spriteKey);
    this.combatant = combatant;
  }
  // Logic for manipulating the combatants....
}

class CombatContainer extends Phaser.GameObjects.Container {
  private combatSprites: CombatSprite[]=[];
  constructor(position: Coords, scene, combatants: Combatant[] = []) {
    super(scene, position.x, position.y);
    combatants.forEach(combatant=>{
      this.combatSprites.push(new CombatSprite(scene,0,0,combatant));
    });
  }
  addCombatant(combatSprite:CombatSprite){
    this.add(combatSprite)
  }
}