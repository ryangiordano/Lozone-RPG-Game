import { Party } from "../components/battle/Party";

export class BattleScene extends Phaser.Scene{
  private partyContainer: Phaser.GameObjects.Container;
  private enemyContainer: Phaser.GameObjects.Container;
  constructor() {
    super('Battle');
    
  }
  init(data){

    //Background set.
    // Two containers:


    this.add.image(0,0,'dungeon_battle_background').setOrigin(0,0).setScale(.5,.5)
    this.partyContainer = new Phaser.GameObjects.Container(this,0,0);
    this.enemyContainer = new Phaser.GameObjects.Container(this,0,0);
    this.input.keyboard.on('keydown', event => {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ESC) {
        this.scene.stop();
        this.scene.manager.wake(data.key);
        this.scene.bringToTop(data.key)
      }
    });

    const party:Party= data.party;
    const enemies = data.enemies;
  }
}