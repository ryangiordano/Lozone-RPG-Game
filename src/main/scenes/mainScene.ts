import { Cast } from './../assets/objects/Cast';
import { Lo } from '../assets/objects/Lo';
import { Interactive } from '../assets/objects/Interactive';
import { DialogManager } from '../assets/services/DialogManager';

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
  private dialogManager: DialogManager;
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
    this.physics.add.overlap(
      this.casts,
      this.interactive,
      (cast: Cast, interactiveObj: Interactive) => {
        cast.destroy();
        if (interactiveObj.properties.type === 'interactive') {
          this.dialogManager.displayDialog(interactiveObj.properties.message);
          this.lo.setCanInput(false);
        }
      }
    );

    this.afterCreate();
  }
  afterCreate() {
    this.dialogManager = new DialogManager(this, () => {
      setTimeout(()=>{
        this.lo.setCanInput(true);
      },200)
    });
    this.input.keyboard.on('keydown', event => {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE) {
        if (this.dialogManager.dialogVisible()) {
          this.dialogManager.handleNextDialog();
        }
      }
    });
    // Phaser.Input.Keyboard.JustDown(space, () => {
    //   console.log('Down');
    // });
  }

  update(): void {
    // Is this really how updates on members of scenes should be handled?
    this.lo.update();
    // this.dialogManager.update();
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
        const message = object.properties.find(p => p.name === 'message');
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
