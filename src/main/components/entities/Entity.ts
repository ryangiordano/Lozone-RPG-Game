import { State } from "../../utility/state/State";
import { createThrottle } from "../../utility/Utility";
import { Cast, CastType, CastData } from "./Cast";
import { AudioScene } from "../../scenes/audioScene";

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
  player,
  itemSwitch,
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
  public flagId;
  public placementFlags: number[];
  public hasPlacementFlags() {
    return this.placementFlags !== undefined;
  }
  public properties: { type?: string; id?: number | string } = {};
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
    const tile = this.currentMap.getTileAt(
      Math.floor(this.x / 64),
      Math.floor(this.y / 64),
      true,
      "foreground"
    );
    return tile;
  }
  /**
   * Sets the item to 'placed', meaning it is visible, it's able to be interacted with,
   * and it sets the tile below it to 'occupied'.
   * @param placed Whether to polace the item on the map.
   */
  public setPlaced(placed: boolean) {
    this.setActive(placed);
    this.setVisible(placed);
    this.setCollideOnTileBelowFoot(placed);
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
    const isOccupiedByAnotherEntity =
      castData.castedOn && castData.castedOn.active;
    if (isOccupiedByAnotherEntity) return;

    tile.properties["collide"] = toCollide;
  }

  /**
   * Emits a throttled Cast that is meant to trigger Entities belowfoot.
   */
  public queryUnderfoot = createThrottle(100, async () => {
    const castResult = await this.emitCast(
      { x: this.x, y: this.y },
      CastType.pressure
    );
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
  protected async emitCast(
    coords: Coords,
    castType?: CastType
  ): Promise<CastData> {
    return new Promise((resolve) => {
      const cast = new Cast(this.currentScene, coords, this, castType);
      this.scene.events.emit("cast-delivered", {
        cast,
      });
      cast.on("resolve", (castData: CastData) => {
        resolve(castData);
      });
    });
  }
}
