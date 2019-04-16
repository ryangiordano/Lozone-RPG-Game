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
    const credits = this.game.cache.json.get('credits');
    this.creditRoller = new CreditRoller({ x: 0, y: 0 }, this, credits);
    this.foregroundContainer = new Phaser.GameObjects.Container(this);

    this.backgroundContainer.add(this.sky);
    this.add.existing(this.backgroundContainer);
    this.add.existing(this.cloudLayer);
    this.add.existing(this.foregroundContainer);
    this.add.existing(this.creditRoller);
    this.setGround();
    this.setMountains();


  }
  create() {
    const ryan = this.add.sprite(9 * 16, 6.6 * 16, 'ryan');
    const lo = this.add.sprite(8 * 16, 6.6 * 16, 'lo');
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
    // Get passed the data from scene.start('SceneName', {data})
    // Create tleset here.
  }
  setMountains(coords?: Coords) {
    const mountains = new ScrollingElement(this, -150, 3 * 16, 'mountains', .05, null, this.backgroundContainer);
    this.backgroundContainer.add(mountains);
  }
  setGround() {
    const ground = new ScrollingElement(this, -150, 8 * 16, 'ground', .2, null, this.backgroundContainer);
    this.backgroundContainer.add(ground);
  }
  update(): void {
  }
}

class ScrollingElement extends Phaser.GameObjects.Image {
  /**
   * An element that destroys itself when it's far enough off screen.
   */
  private addedNew = false;
  constructor(
    private currentScene: Phaser.Scene,
    private startX: number,
    private startY: number,
    private key: string,
    private speedX: number,
    private speedY: number,
    private container: Phaser.GameObjects.Container) {
    super(currentScene, startX, startY, key);
    this.setOrigin(0, .5);
    this.currentScene.events.on('update', this.update, this)
  }
  checkIfDestroyable() {
    if (this.x >= 0 && !this.addedNew) {
      this.addNew();
    }
    if ((this.x > this.currentScene.game.config.width)) {
      this.currentScene.events.off('update', this.update, this)
      this.destroy(true);
      this.container.remove(this, true);
    }


  }
  addNew() {
    const newElement: ScrollingElement = new ScrollingElement(
      this.currentScene, -<number>this.width,
      this.startY, this.key, this.speedX, this.speedY, this.container);
    this.container.add(newElement);
    this.addedNew = true;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.checkIfDestroyable();
  }

}

class Cloud extends Phaser.GameObjects.Image {
  /**
   *
   */
  constructor(private currentScene: Phaser.Scene,
    private startX: number,
    private startY: number,
    private key: string,
    private speedX: number,
    private speedY: number,
    private container: Phaser.GameObjects.Container) {
    super(currentScene, startX, startY, key);

  }
}
class CreditRoller extends Phaser.GameObjects.Container {
  /**
   * Takes in an array of  credit objects.
   */
  private fadeIn: Phaser.Tweens.Tween;
  private fadeOut: Phaser.Tweens.Tween;
  constructor(
    pos: Coords,
    scene: Phaser.Scene, private credits: any[]) {
    super(scene, pos.x, pos.y);

    this.fadeIn = scene.add.tween({
      targets: [this],
      ease: 'Sine.easeInOut',
      duration: 1000,
      delay: 0,
      paused:true,
      alpha: {
        getStart: () => 1,
        getEnd: () => 0
      },
      onComplete: () => {
        //handle completion
        console.log("Done")
      }
    });
    this.fadeOut = scene.add.tween({
      targets: [this],
      ease: 'Sine.easeInOut',
      duration: 1000,
      delay: 0,
      paused:true,
      alpha: {
        getStart: () => 1,
        getEnd: () => 0
      },
      onComplete: () => {
        //handle completion
        console.log("Done")
      }
    });

    this.add(new Phaser.GameObjects.Text(scene, 0, 0, 'HELLO', {
      fontFamily: 'pixel',
      fontSize: '8px',
      fill: '#000000'
    }))

    setTimeout(()=>{
      this.fadeOut.play(true);
    },2000)
  }
  rollCredits() {

  }
  setTimeBetweenCredits() {

  }

  creditsDone() {
    this.emit('credits-finished');
  }

}