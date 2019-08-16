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
    this.currentTile.properties["collide"] = true;
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
}

export class Chest extends Entity {
  /**
   * Represents a chest on the overall, able to be opened.
   */
  public properties: { type: string; id: number | string; message: string };
  public open: Boolean;
  constructor({ scene, x, y, map, properties }) {
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
    this.setFrame(1, false);
  }
}

export class KeyItem extends Entity {
  /**
   *  Represents unique key items able to be picked up on the overworld.
   */
  public properties: { type: string; id: number | string; message: string };
  constructor({ scene, x, y, map, properties }) {
    const { spriteKey, frame } = properties;
    super({ scene, x, y, key: spriteKey, map });
    this.properties = properties;
    this.setFrame(frame);
  }
  public pickup() {
    this.currentScene.events.emit("item-acquired", {
      itemId: this.properties["itemId"],
      id: this.properties["id"]
    });
    this.destroy();
  }
}
