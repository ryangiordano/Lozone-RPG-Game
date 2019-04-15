export class CreditsScene extends Phaser.Scene {
  private sky: Phaser.GameObjects.Image;
  private ground: Phaser.GameObjects.Image;
  private mountains: Phaser.GameObjects.Image;
  private backgroundContainer: Phaser.GameObjects.Container;
  private foregroundContainer: Phaser.GameObjects.Container
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
    this.foregroundContainer = new Phaser.GameObjects.Container(this);

    this.backgroundContainer.add(this.sky);
    this.add.existing(this.backgroundContainer);
    this.setGround();
    this.setMountains();


    // Handle loading assets here, adding sounds etc

  }
  init(data) {
    // Get passed the data from scene.start('SceneName', {data})
    // Create tleset here.
  }
  setMountains(coords?: Coords) {
    const mountains = new ScrollingElement(this, -150, 3 * 16, 'mountains', .1, null, this.backgroundContainer);
    this.backgroundContainer.add(mountains);
  }
  setGround() {
    const ground = new ScrollingElement(this, -150, 8 * 16, 'ground', .3, null, this.backgroundContainer);
    this.backgroundContainer.add(ground);
  }
  update(): void {
    this.events.emit('update');
  }
}

class ScrollingElement extends Phaser.GameObjects.Image {
  /**
   * An element that destroys itself when it's far enough off screen.
   */
  private addedNew =false;
  constructor(
    private currentScene: Phaser.Scene,
    private startX: number,
    private startY: number,
    private key: string,
    private speedX: number,
    private speedY: number,
    private container: Phaser.GameObjects.Container) {
    super(currentScene, startX, startY, key);
      // this.scene['updates'].add(this)
      this.setOrigin(0,.5);
      this.currentScene.events.on('update', this.update, this)
  }
  checkIfDestroyable() {
    if(this.x >= 0 && !this.addedNew){
      this.addNew();
    }
    if ((this.x >this.currentScene.game.config.width)) {
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