import { Item } from '../../components/entities/Item';

export enum EntityTypes {
  npc,
  trigger,
  interactive,
  bossMonster,
  keyItem,
  chest,
  door
}

export class Entity extends Phaser.GameObjects.Sprite {
  protected currentMap: Phaser.Tilemaps.Tilemap;
  protected currentScene: Phaser.Scene;
  protected currentTile: Phaser.Tilemaps.Tile;
  // TODO: Refactor how we store casts locally, this sucks.
  protected casts: Phaser.GameObjects.Group;
  constructor({ scene, x, y, key, map }) {
    super(scene, x, y, key);
    this.currentScene = scene;
    this.currentMap = map;
    this.currentScene.add.existing(this);
    this.initSprite();
    this.currentTile = this.getTileBelowFoot();
    this.setCollideOnTileBelowFoot(true);
  }
  private initSprite() {
    this.setOrigin(0.5, 0.5);
    this.setFlipX(false);
    this.currentScene.physics.world.enable(this);
  }
  protected getTileBelowFoot() {
    const tile = this.currentMap.getTileAt(Math.floor(this.x / 64), Math.floor(this.y / 64), true, "foreground");
    return tile;
  }

  protected setCollideOnTileBelowFoot(toCollide: boolean) {
    this.currentTile.properties["collide"] = toCollide;
  }
}

//TODO: Split chests and locked chests out into separate entities
// So we don't have to play games with the frames;
export class Chest extends Entity {

  /**
   * Represents a chest on the overall, able to be opened.
   */
  public entityType: EntityTypes = EntityTypes.chest;
  public properties: { type: string; id: number | string; message: string };
  public open: Boolean;
  public locked: Boolean;
  constructor({ scene, x, y, map, properties }, public unlockItemId: number) {
    super({ scene, x, y, key: "chest", map });
    this.properties = properties;
  }
  public openChest() {
    if (!this.open) {
      this.setOpen();
      this.currentScene.sound.play("chest", { volume: 0.1 });
      this.currentScene.events.emit("item-acquired", {
        itemId: this.properties["itemId"],
        id: this.properties["id"]
      });
    }
  }
  public setOpen() {
    this.open = true;
    this.unlockItemId ? this.setFrame(5, false) : this.setFrame(1, false);
  }
  public lock() {
    this.locked = true;
    this.setFrame(4, false)
  }
  public unlock() {
    this.currentScene.sound.play("lock-open", { volume: 0.1 });
    this.locked = false;
  }
}

export class KeyItem extends Entity {
  /**
   *  Represents unique key items able to be picked up on the overworld.
   */
  public entityType: EntityTypes;
  public properties: { type: string; id: number | string; message: string };
  constructor({ scene, x, y, map, properties }) {
    const { spriteKey, frame } = properties;
    super({ scene, x, y, key: spriteKey, map });
    this.properties = properties;
    this.setFrame(frame);
    this.entityType = EntityTypes.keyItem;
  }
  public pickup() {
    this.currentScene.events.emit("item-acquired", {
      itemId: this.properties["itemId"],
      id: this.properties["id"],
      isKeyItem: true
    });
    this.setCollideOnTileBelowFoot(false);
    this.destroy();
  }
}

export class LockedDoor extends Entity {
  /**
 *  Represents locked doors on the map.
 */
  public entityType: EntityTypes = EntityTypes.door;
  public properties: { type: string; id: number | string; };
  constructor({ scene, x, y, map, properties }, public unlockItemId: number) {
    super({ scene, x, y, key: 'door', map });
    this.properties = properties;

  }
  public unlock() {
    this.currentScene.sound.play("lock-open", { volume: 0.1 });
    this.setCollideOnTileBelowFoot(false);
    this.destroy();
  }
}