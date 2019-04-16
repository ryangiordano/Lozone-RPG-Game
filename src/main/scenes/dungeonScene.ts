import { Explore } from "./exploreScene";

export class DungeonScene extends Explore {

  constructor() {
    super('Dungeon');

  }

  afterCreated() {
    this.player.on('finished-movement', () => {
      const random = Math.floor(Math.random() * 20);
      console.log(random)
      if(random=== 10){
        this.scene.manager.pause(this.scene.key);
        this.scene.run('Battle', {key: this.scene.key})
      }

    })
  }
}