class Cloud extends Phaser.GameObjects.Image {
  /**
   *
   */
  constructor(
    private currentScene: Phaser.Scene,
    private startX: number,
    private startY: number,
    private key: string,
    private speedX: number,
    private speedY: number,
    private container: Phaser.GameObjects.Container
  ) {
    super(currentScene, startX, startY, key);
  }
}
