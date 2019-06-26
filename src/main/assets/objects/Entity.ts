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
