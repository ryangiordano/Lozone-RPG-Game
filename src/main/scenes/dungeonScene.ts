import { Explore } from "./exploreScene";
import { Combatant } from "../components/battle/Combatant";

export class DungeonScene extends Explore {
  private enemyMap:Map<number,Combatant[]>;
  constructor() {
    super('Dungeon');

  }

  afterCreated() {
    this.player.on('finished-movement', () => {
      const random = Math.floor(Math.random() * 20);
      if (random === 10) {
        setTimeout(() => {

          this.input.keyboard.resetKeys();
          this.scene.manager.sleep(this.scene.key);
          this.scene.run('Battle', { key: this.scene.key,  })
        }, 500)
      }

    });


  }
}