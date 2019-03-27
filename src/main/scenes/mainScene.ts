export class MainScene extends Phaser.Scene {
  private map: Phaser.Tilemaps.Tilemap;
  private tileset: Phaser.Tilemaps.Tileset;
  private backgroundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private foregroundLayer: Phaser.Tilemaps.StaticTilemapLayer;

  constructor() {
    super({
      key: "MainScene"
    });
  }

  preload(): void {
    // this.load.image("logo", "./src/boilerplate/assets/phaser.png");
  }

  create(): void {
    // this.phaserSprite = this.add.sprite(400, 300, "logo");
    this.map = this.make.tilemap({ key: this.registry.get("room") });
    this.tileset = this.map.addTilesetImage("room-tiles");

    this.map.createStaticLayer("foreground", this.tileset, 0, 0);
  }
}
