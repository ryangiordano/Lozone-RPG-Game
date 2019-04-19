import { EnemyController } from "../data/controllers/EnemyController";
import { StateManager } from "../utility/state/StateManager";

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
    const slime = this.enemyController.getEnemyById(6);
    this.add.image(0, 0, 'dungeon_battle_background').setOrigin(0, 0).setScale(.5, .5);

    this.partyContainer = new Phaser.GameObjects.Container(this, 0, 0);
    this.enemyContainer = new Phaser.GameObjects.Container(this, 5 * 8, 0);

    const enemies = data.enemies;

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
}