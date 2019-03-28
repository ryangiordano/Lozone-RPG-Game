import { Lo } from "../assets/objects/Lo";

export class MainScene extends Phaser.Scene {
  private map: Phaser.Tilemaps.Tilemap;
  private tileset: Phaser.Tilemaps.Tileset;
  private backgroundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private foregroundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private lo: Lo;
  private interactive: Phaser.GameObjects.Group;
  private spawn: Phaser.GameObjects.Group;

  constructor() {
    super({
      key: "MainScene"
    });
  }

  preload(): void {}

  create(): void {
    this.map = this.make.tilemap({ key: "room" });
    this.tileset = this.map.addTilesetImage(
      "room-tiles",
      "room-tiles",
      8,
      8,
      0,
      0,
      1
    );
    this.interactive = this.add.group({
      runChildUpdate: true
    })
    this.backgroundLayer = this.map.createStaticLayer(
      "background",
      this.tileset
    );
    this.foregroundLayer = this.map.createStaticLayer(
      "foreground",
      this.tileset
    );
    this.foregroundLayer.setName("foreground");
    this.foregroundLayer.setCollisionByProperty({ collide: true });

    //Game Objects
    this.spawn = this.add.group({
      runChildUpdate:true
    });
    this.interactive = this.add.group({
      runChildUpdate:true
    });


    this.physics.add.collider(this.lo, this.foregroundLayer);


    this.loadObjectsFromTilemap();
  }
  update():void{
    this.lo.update();
  }
  private loadObjectsFromTilemap(): void {
    const objects = this.map.getObjectLayer("objects").objects as any[];

    this.lo = new Lo({
      scene: this,
      x: 100,
      y: 100,
      key: "lo"
    });

    
    this.cameras.main.startFollow(this.lo);
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
  }
}
