export class ScrollingElement extends Phaser.GameObjects.Image {
  /**
   * An element that destroys itself when it's far enough off screen.
   */
  private frozen = false;
  private addedNew = false;
  constructor(
    private currentScene: Phaser.Scene,
    private startX: number,
    private startY: number,
    private key: string,
    private speedX: number,
    private speedY: number,
    private repeatable: boolean,
    private container: Phaser.GameObjects.Container) {
    super(currentScene, startX, startY, key);
    this.setOrigin(0, .5);
    this.currentScene.events.on('update', this.update, this);
  }
  checkIfDestroyable() {
    if (this.x >= 0 && !this.addedNew && this.repeatable) {
      this.addNew();
    }
    if ((this.x -this.width > this.currentScene.game.config.width)) {
      this.currentScene.events.off('update', this.update, this);
      this.destroy(true);
      this.container.remove(this, true);
    }
  }
  addNew() {
    const newElement: ScrollingElement = new ScrollingElement(this.currentScene, -<number>this.width + 1, this.startY, this.key, this.speedX, this.speedY, this.repeatable, this.container);
    this.container.add(newElement);
    this.addedNew = true;
  }
  update() {
    if (!this.frozen) {
      this.x += this.speedX;
      this.y += this.speedY;
      this.checkIfDestroyable();
    }

  }
  pause() {
    this.frozen = true;
  }
  resume() {
    this.frozen = false;
  }
}
