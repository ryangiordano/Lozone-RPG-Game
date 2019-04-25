import { AnimationHelper } from '../utility/animation-helper';
import { State } from '../utility/state/State';

export class BootScene extends Phaser.Scene {
  private loadingBar: Phaser.GameObjects.Graphics;
  private progressBar: Phaser.GameObjects.Graphics;
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.sound.add('startup');
    this.cameras.main.setBackgroundColor(0xffffff);
    this.createLoadingGraphics();
    this.load.on(
      'complete',
      () => {
        const daruma = this.add.text(50, 99, 'Daruma®', {
          fontFamily: 'pixel',
          fontSize: '10px',
          fill: '#000000',
          fontWeight: 'bold'
        });

        new AnimationHelper(this, this.cache.json.get('ryanAndLoAnimation'));
        const sprite = this.add.sprite(80, 65, 'ryanandlo');
        sprite.scaleX = 0.3;
        sprite.scaleY = 0.3;
        sprite.anims.play('shine-in');
        sprite.on('animationcomplete', () => {
          this.sound.play('startup');
        });
        // TODO Move animation helper calls to individual sprites that use the animation
        new AnimationHelper(this, this.cache.json.get('loAnimation'));
        new AnimationHelper(this, this.cache.json.get('ryanAnimation'));

        // When we get to the point where we can save state to a JSON, this is where we'd load it in, flipping the proper flags.
        const sm = State.getInstance();
        sm.initialize(this.game);
        sm.addFlagModule('chests');

        // this.scene.start('House', { map: 'room', tileset: 'room-tiles' });
        this.scene.start('Dungeon', { map: 'dungeon_1', tileset: 'dungeon', warpId: 1, enemyParties: [8,6,4,3] });
      },
      this
    );
    // Load the packages
    this.load.pack(
      'preload_spritesheets',
      './src/main/assets/pack/spritesheets.json', 'preload_spritesheets');
    this.load.pack(
      'preload_images',
      './src/main/assets/pack/image.json',
      'preload_images')
    this.load.pack(
      'preload_audio',
      './src/main/assets/pack/audio.json',
      'preload_audio')
    this.load.pack(
      'preload_data',
      './src/main/assets/pack/data.json',
      'preload_data')
    this.load.pack(
      'preload_tilemaps',
      './src/main/assets/pack/tilemaps.json',
      'preload_tilemaps')
    this.load.pack('preload', './src/main/assets/pack.json', 'preload');
  }
  private createLoadingGraphics(): void {
    // We can specify the type of config we want to send.

  }
}
