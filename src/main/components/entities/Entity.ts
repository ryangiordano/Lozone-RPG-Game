
export enum EntityTypes {
  npc,
  trigger,
  warp,
  spawn,
  interactive,
  bossMonster,
  keyItem,
  chest,
  door
}


/**
 * A basic building block for an item on a map.
 * Entities by default take up space and set the ground under them to collide.
 * They can be interacted with in different ways (doors and locked chests can be unlocked
 * and key items can be picked up.)
 */
export class Entity extends Phaser.GameObjects.Sprite {
  protected currentMap: Phaser.Tilemaps.Tilemap;
  protected currentScene: Phaser.Scene;
  protected currentTile: Phaser.Tilemaps.Tile;
  public entityType: EntityTypes;
  // TODO: Refactor how we store casts locally, this sucks.
  protected casts: Phaser.GameObjects.Group;
  constructor({ scene, x, y, key }) {
    super(scene, x, y, key);
    this.currentScene = scene;
    this.currentMap = scene.map;
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
    const tile = this.getTileBelowFoot();
    tile.properties["collide"] = toCollide;
  }
}

/**
 * Performs an action or flips a flag when the character steps on it.
 * 
 */
export class Trigger extends Entity {
  //TODO: Implement this in game.  Currently there isn't anything in game using a trigger...;
  constructor({ scene, x, y }) {
    super({ scene, x, y, key: null });
    this.displayWidth = 16;
    this.displayHeight = 16;
    this.visible = false;
  }
}
/**
 * Carries data for warping to different maps.
 */
export class WarpTrigger extends Entity {
  public warpId: number;
  constructor({ scene, x, y, warpId }) {
    super({ scene, x, y, key: null });
    this.warpId = warpId;
    this.visible = false;
    this.entityType = EntityTypes.warp;
    this.setCollideOnTileBelowFoot(false);
  }
}

/**
 * A fallback object for maps where the warp endpoint is not explicitly set.
 */
export class Spawn extends Entity {
  constructor({ scene, x, y }) {
    super({ scene, x, y, key: null });
    this.entityType = EntityTypes.spawn;
    this.visible = false;
    this.setCollideOnTileBelowFoot(false);
  }
}


//TODO: Split chests and locked chests out into separate entities
// So we don't have to play games with the frames;
/**
 * Represents a chest on the overall, able to be opened.
 */
export class Chest extends Entity {
  public properties: { type: string; id: number | string; message: string };
  public open: Boolean;
  public locked: Boolean;
  constructor({ scene, x, y, properties }, public unlockItemId: number) {
    super({ scene, x, y, key: "chest" });
    this.properties = properties;
    this.entityType = EntityTypes.chest;
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

/**
 *  Represents unique key items able to be picked up on the overworld.
 */
export class KeyItem extends Entity {
  public properties: { type: string; id: number | string; message: string };
  constructor({ scene, x, y, properties }) {
    const { spriteKey, frame } = properties;
    super({ scene, x, y, key: spriteKey });
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

/**
 *  Represents locked doors on the map.
 */
export class LockedDoor extends Entity {
  public properties: { type: string; id: number | string; };
  constructor({ scene, x, y, map, properties }, public unlockItemId: number) {
    super({ scene, x, y, key: 'door' });
    this.properties = properties;
    this.entityType = EntityTypes.door;

  }
  public unlock() {
    this.currentScene.sound.play("lock-open", { volume: 0.1 });
    this.setCollideOnTileBelowFoot(false);
    this.destroy();
  }
}