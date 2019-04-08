import { Entity } from './Entity';

export class Chest extends Entity {
  /**
   *
   */
  public properties: { type: string; id: number | string; message: string };
  public open: Boolean;
  constructor({ scene, x, y, map, properties }) {
    super({ scene, x, y, key: 'chest', map });
    this.properties = properties;
  }
  public openChest() {
    if (!this.open) {
      this.setOpen();
      this.currentScene.sound.play('chest');
      this.currentScene.events.emit('item-acquired', {
        itemId: this.properties['itemId'],
        id: this.properties['id']
      });
    }
  }
  public setOpen(){
    this.open = true;
    this.setFrame(1,false);
  }
}
