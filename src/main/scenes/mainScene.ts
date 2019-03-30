import { Lo } from '../assets/objects/Lo';

export class MainScene extends Phaser.Scene {
  private map: Phaser.Tilemaps.Tilemap;
  private tileset: Phaser.Tilemaps.Tileset;
  private backgroundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private foregroundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private lo: Lo;
  private interactive: Phaser.GameObjects.Group;
  private spawn: Phaser.GameObjects.Group;
  private bump: Phaser.Sound.BaseSound;
  constructor() {
    super({
      key: 'MainScene'
    });
  }

  preload(): void {
   this.bump =  this.sound.add("bump");
  }

  create(): void {
    this.map = this.make.tilemap({ key: 'room' });
    this.tileset = this.map.addTilesetImage(
      'room-tiles',
      'room-tiles',
      16,
      16,
      0,
      0,
      1
    );
    this.interactive = this.add.group({
      runChildUpdate: true
    });

    this.backgroundLayer = this.map.createStaticLayer(
      'background',
      this.tileset
    );

    this.foregroundLayer = this.map.createStaticLayer(
      'foreground',
      this.tileset
    );

    this.backgroundLayer.setName('background');

    this.foregroundLayer.setName('foreground');
    this.foregroundLayer.setCollisionByProperty({ collide: true }, true);
    // this.backgroundLayer.setCollisionByProperty({ collide: true });

    //Game Objects
    this.spawn = this.add.group({
      runChildUpdate: true
    });
    this.interactive = this.add.group({
      runChildUpdate: true
    });
    this.map.setCollisionBetween(0, 3000, true);

    this.loadObjectsFromTilemap();
    this.physics.add.collider(this.lo, this.foregroundLayer, r => {
      console.log('Collided', r);
    });
  }
  update(): void {
    // Is this really how updates on members of scenes should be handled?
    this.lo.update();
  }
  private loadObjectsFromTilemap(): void {
    const objects = this.map.getObjectLayer('objects').objects as any[];
    const spawn = objects.find(o => o.type === 'spawn' && o.name === 'front');
    // TODO: Make this its own abstraction (spawning)
    this.lo = new Lo({
      scene: this,
      x: spawn.x + 8,
      y: spawn.y + 8,
      key: 'lo',
      map: this.map
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
