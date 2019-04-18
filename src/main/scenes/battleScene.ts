import { Party } from "../components/battle/Party";
import { EnemyController } from "../data/controllers/EnemyController";
import { PartyController } from "../data/controllers/PartyController";

export class BattleScene extends Phaser.Scene {
  private partyContainer: Phaser.GameObjects.Container;
  private enemyContainer: Phaser.GameObjects.Container;
  private enemyController: EnemyController;
  private partyController: PartyController;
  constructor() {
    super('Battle');
  }
  init(data) {
    this.partyController = new PartyController(this.game);
    this.enemyController = new EnemyController(this.game);
    const lo = this.partyController.getPartyMemberById(1);
    const slime = this.enemyController.getEnemyById(6);
    this.add.image(0, 0, 'dungeon_battle_background').setOrigin(0, 0).setScale(.5, .5);

    this.partyContainer = new Phaser.GameObjects.Container(this, 0, 0);
    this.enemyContainer = new Phaser.GameObjects.Container(this, 0, 0);

    const party: Party = data.party;
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