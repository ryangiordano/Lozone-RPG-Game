import { Cast } from './../assets/objects/Cast';
import { Lo } from '../assets/objects/Lo';
import { Interactive } from '../assets/objects/Interactive';

export class MainScene extends Phaser.Scene {
  private map: Phaser.Tilemaps.Tilemap;
  private tileset: Phaser.Tilemaps.Tileset;
  private backgroundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private foregroundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private lo: Lo;
  private interactive: Phaser.GameObjects.Group;
  private spawn: Phaser.GameObjects.Group;
  private bump: Phaser.Sound.BaseSound;
  private casts: Phaser.GameObjects.Group;
  constructor() {
    super({
      key: 'MainScene'
    });
  }

  preload(): void {
    this.bump = this.sound.add('bump');
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
    //Game Objects
    this.spawn = this.add.group({
      runChildUpdate: true
    });

    this.casts = this.add.group({
      runChildUpdate: true
    });
    this.interactive = this.add.group({
      runChildUpdate: true
    });
    // this.map.setCollisionBetween(0, 3000, true);

    this.loadObjectsFromTilemap();

    // *****************************************************************
    // COLLIDERS
    // *****************************************************************
    this.physics.add.overlap(this.casts, this.interactive, (obj1: Cast, obj2: Interactive) => {
      obj1.destroy();
      if(obj2.properties.type === 'interactive'){
        console.log(obj2.properties.message);
      }
      
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
      map: this.map,
      casts: this.casts
    });

    objects.forEach(object => {
      if (object.type === 'interactive') {
        const message = object.properties.find(p=>p.name==='message')
        this.interactive.add(
          new Interactive({
            scene: this,
            x: object.x + 8,
            y: object.y + 8,
            properties: {
              type: object.type,
              id: object.id,
              message: message && message.value
            }
          })
        );
      }
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
