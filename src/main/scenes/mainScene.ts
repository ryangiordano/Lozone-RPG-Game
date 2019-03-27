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
    this.map = this.make.tilemap({ key: "room" });
    this.tileset = this.map.addTilesetImage("room-tiles","room-tiles", 8,8,0,0,1);

    this.backgroundLayer = this.map.createStaticLayer(
      "background",
      this.tileset
    );
    this.foregroundLayer = this.map.createStaticLayer(
      "foreground",
      this.tileset
    );
    debugger;
    // this.foregroundLayer.setName("foreground");

  }
}
