import { Entity } from './Entity';

export class Chest extends Entity {
  /**
   *
   */
  public properties: { type: string; id: number | string; message: string };
  private open: Boolean;
  constructor({ scene, x, y, map, properties }) {
    super({ scene, x, y, key:'chest' , map });
    this.properties = properties;

  }
  public openChest(){
    if(!this.open){
      this.setFrame(1, false);
      this.open = true;
      this.currentScene.sound.play('chest');
      this.currentScene.events.emit('item-acquired', this.properties['itemId']);
    }
  }

}
