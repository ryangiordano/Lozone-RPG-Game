import { State } from "../../utility/state/State";
import { createThrottle } from "../../utility/Utility";
import { Cast, CastType, CastData } from "./Cast";

export enum EntityTypes {
  npc,
  trigger,
  warp,
  spawn,
  interactive,
  bossMonster,
  keyItem,
  chest,
  door,
  player
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

  /**
   * Sets collision on or off below foot.  Contains a check to see whether the Entity
   * shares a space with another Entity, preventing the
   * tile from being set to unoccupied if there is.
   * @param toCollide boolean to decide whether the tile below needs to be effectively 'occupied'
   */
  protected async setCollideOnTileBelowFoot(toCollide: boolean) {
    const tile = this.getTileBelowFoot();
    const castData: CastData = await this.emitCast({ x: this.x, y: this.y });
    const isOccupiedByAnotherEntity = castData.castedOn && castData.castedOn.active;
    if (isOccupiedByAnotherEntity) return;

    tile.properties["collide"] = toCollide;
  }

  /**
   * Emits a throttled Cast that is meant to trigger Entities belowfoot.
   */
  public queryUnderfoot = createThrottle(100, async () => {
    const castResult = await this.emitCast({ x: this.x, y: this.y }, CastType.pressure);
    return castResult;
  });

  /**
   * Places an invisible Cast on the map.  The Cast has physics and will 
   * interact with Entities on the map, gathering and sending back data 
   * on the Entity it collides with before destroying itself.
   * @param coords The coordinates that the cast is emitted on.
   * @param castType The type of cast we're emitting.  Important for
   *  things that respond to pressure(Casting Entity is on top of it) or
   *  by reach (Casting Entity is adjacent)
   */
  protected async emitCast(coords: Coords, castType?: CastType): Promise<CastData> {
    return new Promise(resolve => {
      const cast = new Cast(
        this.currentScene,
        coords,
        this,
        castType,
      );
      this.scene.events.emit('cast-delivered', {
        cast
      });
      cast.on('resolve', (castData: CastData) => {
        resolve(castData);
      });
    });


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
        flagId: this.properties["id"],
        chestCoords: { x: this.x, y: this.y }
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
  this.currentScene.sound.play("unlock", { volume: 0.1 });
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
  /**
   * Collects the item, removing it from the map and adding it to the player's inventory.
   */
  public pickup() {
    this.currentScene.events.emit("item-acquired", {
      itemId: this.properties["itemId"],
      flagId: this.properties["flagId"],
      isKeyItem: true,
      chestCoords: { x: this.x, y: this.y }
    });
    this.setCollideOnTileBelowFoot(false);
    this.destroy();
  }

  /**
   * Sets the item to 'placed', meaning it is visible, it's able to be interacted with,
   * and it sets the tile below it to 'occupied'.
   * @param placed Whether to polace the item on the map.
   */
  public setPlaced(placed: boolean) {
    this.setActive(placed)
    this.setVisible(placed)
    this.setCollideOnTileBelowFoot(placed)
  }

  public isFlagged(): boolean {
    const sm = State.getInstance();
    return sm.allAreFlagged([this.properties['placementFlag']]);
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