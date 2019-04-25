import { CreditRoller } from "../../components/credits/CreditRoller";
import { ScrollingElement } from "../../components/credits/ScrollingElement";
import { makeFadeOut, makeFadeIn } from "../../utility/tweens/fade";

export class CreditsScene extends Phaser.Scene {
  private sky: Phaser.GameObjects.Image;
  private ground: Phaser.GameObjects.Image;
  private mountains: Phaser.GameObjects.Image;
  private backgroundContainer: Phaser.GameObjects.Container;
  private foregroundContainer: Phaser.GameObjects.Container;
  private cloudLayer: Phaser.GameObjects.Container;
  private creditRoller: CreditRoller
  private ryan;
  private lo;
  constructor() {
    super({ key: 'CreditsScene' });

  }
  preload(): void {
    this.sound.add('credits');
    this.sound.add('end');

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
    this.creditRoller = new CreditRoller({ x: 0, y: 0 }, this, credits, () => {
      this.setStorkFlight();
    });
    this.foregroundContainer = new Phaser.GameObjects.Container(this);

    this.backgroundContainer.add(this.sky);
    this.add.existing(this.backgroundContainer);
    this.add.existing(this.cloudLayer);
    this.add.existing(this.foregroundContainer);
    this.add.existing(this.creditRoller);
    this.creditRoller.rollCredits();
    this.setGround();
    this.setMountains();

    this.setClouds();
  }
  create() {
    this.createAnimations();

  }
  private setStorkFlight() {
    this.pauseAll();

    this.cameras.main.pan(80, -50, 8000, 'Linear', false, (camera, progress) => {
      if (progress === 1) {
        setTimeout(() => {
          const stork = new Phaser.GameObjects.Sprite(this, 175, -50, 'stork')
          this.add.existing(stork);
          this.foregroundContainer.add(stork);
          stork.anims.play('storkFly', true);
          this['updates'].add(stork)
          stork.update = () => {
            stork.x -= .2;
            if (stork.x <= 0) {
              this.postCreditsStart();
              stork.destroy();
            }
          }
        }, 1500)
      }

    });
  }
  private postCreditsStart() {
    this.sound.play('end', {
      mute: false,
      volume: 1,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: true,
      delay: 3
    });

    const coming = this.add.text(25, -50, "Coming December 2019", {
      fontFamily: 'pixel',
      fontSize: '8px',
      fill: '#000000',
      align: 'center',
      padding: 2,
      wordWrap: { width: <number>this.game.config.width, useAdvancedWrap: true }
    });
    const happyAnniversary = this.add.text(15, -50, "Happy 5 Year Anniversary, Lolobear.", {
      fontFamily: 'pixel',
      fontSize: '8px',
      fill: '#000000',
      align: 'center',
      padding: 2,
      wordWrap: { width: <number>this.game.config.width, useAdvancedWrap: true }
    });
    happyAnniversary.setAlpha(0);
    const fadeOut = makeFadeOut(coming, 1000, this, () => {
      fadeIn.play(false);
    });
    const fadeIn = makeFadeIn(happyAnniversary, 1000, this);
    setTimeout(() => {
      fadeOut.play(false);
    }, 5000)
  }

  private createAnimations() {
    this.ryan = this.add.sprite(9 * 16, 7.6 * 16, 'ryan');
    this.lo = this.add.sprite(8 * 16, 7.6 * 16, 'lo');
    this.anims.create({
      key: 'storkFly',
      frames: this.anims.generateFrameNumbers('stork', { frames: [0, 1, 2, 3, 4, 3, 2, 1] }),
      frameRate: 6,
      repeat: -1
    });

    this.foregroundContainer.add(this.lo);
    this.foregroundContainer.add(this.ryan);
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
    this.lo.anims.delayedPlay(300, 'loWalk');
    this.ryan.anims.play('ryanWalk', true);
  }
  private pauseAll() {
    this.backgroundContainer.list.forEach(scrollingElement => {
      const el = <ScrollingElement>scrollingElement;
      if (el.hasOwnProperty('pause')) {
        el.pause();
      }
    });
    this.foregroundContainer.list.forEach(scrollingElement => {
      const el = <ScrollingElement>scrollingElement;
      if (el.hasOwnProperty('pause')) {
        el.pause();
      }
    });
    this.ryan.setFrame(3);
    this.lo.setFrame(3);
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
    const mountains = new ScrollingElement(this, -150, 5 * 16, 'mountains', .05, null, true, this.backgroundContainer);
    this.backgroundContainer.add(mountains);
  }
  setGround() {
    const ground = new ScrollingElement(this, -150, 8.5 * 16, 'ground', .2, null, true, this.backgroundContainer);
    this.backgroundContainer.add(ground);
  }
  setClouds() {
    const clouds = ['cloud_1',
      'cloud_2',
      'cloud_3',
      'cloud_4'];
    setInterval(() => {
      const randomCloud = clouds[Math.ceil(Math.random() * clouds.length - 1)];
      const randomPlacement = Math.ceil(Math.random() * 30)
      const cloud = new ScrollingElement(this, -30, randomPlacement, randomCloud, .1, null, false, this.cloudLayer);
      // cloud.setScale(.25, .25)
      cloud.setOrigin(.5, .5)
      cloud.setAlpha(.7)
      this.cloudLayer.add(cloud)
    }, 2000)
  }
  update(): void {
  }
}


