import { CreditRoller } from "../components/dungeon/credits/CreditRoller";
import { ScrollingElement } from "../components/dungeon/credits/ScrollingElement";

export class CreditsScene extends Phaser.Scene {
  private sky: Phaser.GameObjects.Image;
  private ground: Phaser.GameObjects.Image;
  private mountains: Phaser.GameObjects.Image;
  private backgroundContainer: Phaser.GameObjects.Container;
  private foregroundContainer: Phaser.GameObjects.Container;
  private cloudLayer: Phaser.GameObjects.Container;
  private creditRoller: CreditRoller
  constructor() {
    super({ key: 'CreditsScene' });

  }
  preload(): void {
    this.sound.add('credits');
    this.sound.play('credits', {
      mute: false,
      volume: 1,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: false,
      delay: 0
    });
    this.sky = this.add.image(10, 0, 'sky');

    this.backgroundContainer = new Phaser.GameObjects.Container(this, 0, 0);
    this.cloudLayer = new Phaser.GameObjects.Container(this, 0, 0);
    const credits = [...this.game.cache.json.get('credits').credits];
    this.creditRoller = new CreditRoller({ x: 0, y: 0 }, this, credits);
    this.foregroundContainer = new Phaser.GameObjects.Container(this);

    this.backgroundContainer.add(this.sky);
    this.add.existing(this.backgroundContainer);
    this.add.existing(this.cloudLayer);
    this.add.existing(this.foregroundContainer);
    this.add.existing(this.creditRoller);
    this.creditRoller.rollCredits();
    this.setGround();
    this.setMountains();


  }
  create() {
    const ryan = this.add.sprite(9 * 16, 7.6 * 16, 'ryan');
    const lo = this.add.sprite(8 * 16, 7.6 * 16, 'lo');
    this.foregroundContainer.add(lo);
    this.foregroundContainer.add(ryan);
    this.anims.create({
      key: 'ryanWalk',
      frames: this.anims.generateFrameNumbers('ryan', { frames: [7, 6, 8, 6] }),
      frameRate: 3,
      repeat: -1
    })
    this.anims.create({
      key: 'loWalk',
      frames: this.anims.generateFrameNumbers('lo', { frames: [7, 6, 8, 6] }),
      frameRate: 3,
      repeat: -1
    })
    lo.anims.delayedPlay(300, 'loWalk');
    ryan.anims.play('ryanWalk', true);
  }
  init(data) {
    //DEBUG
    this.input.keyboard.on('keydown', event => {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ESC) {
        this.sound.stopAll();
        this.scene.start('House', { map: 'room', tileset: 'room-tiles' });
      }
    });
    //DEBUG
  }
  setMountains(coords?: Coords) {
    const mountains = new ScrollingElement(this, -150, 5 * 16, 'mountains', .05, null, this.backgroundContainer);
    this.backgroundContainer.add(mountains);
  }
  setGround() {
    const ground = new ScrollingElement(this, -150, 8.5 * 16, 'ground', .2, null, this.backgroundContainer);
    this.backgroundContainer.add(ground);
  }
  update(): void {
  }
}


