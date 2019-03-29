export class Lo extends Phaser.GameObjects.Sprite {
  private currentScene: Phaser.Scene;
  private keys: Map<string, Phaser.Input.Keyboard.Key>;
  private isMoving = false;
  private velocityX = 0;
  private velocityY = 0;
  private target = { x: 0, y: 0 };
  /**
   *
   */
  constructor({ scene, x, y, key }) {
    super(scene, x, y, key);
    this.currentScene = scene;
    this.initSprite();
    this.currentScene.add.existing(this);
  }
  private getKeys(): Map<string, Phaser.Input.Keyboard.Key> {
    return this.keys;
  }
  private initSprite() {
    this.setOrigin(0.5, 0.5);
    this.setFlipX(false);
    this.keys = new Map([
      ['LEFT', this.addKey('LEFT')],
      ['RIGHT', this.addKey('RIGHT')],
      ['DOWN', this.addKey('DOWN')],
      ['UP', this.addKey('UP')]
    ]);

    this.currentScene.physics.world.enable(this);
  }
  private addKey(key: string): Phaser.Input.Keyboard.Key {
    return this.currentScene.input.keyboard.addKey(key);
  }
  update(): void {
    if (this.isMoving) {
      this.moveToTarget();
    } else {
      this.handleInput();
    }
  }
  private moveToTarget() {
    if (this.x === this.target.x && this.y === this.target.y) {
      this.isMoving = false;
    }else{
      if(this.x!== this.target.x){
        this.x+=this.velocityX;
      }
      if(this.y!== this.target.y){
        this.y+=this.velocityY;
      }
    }
  }
  private handleInput() {
    if (this.keys.get('RIGHT').isDown) {
      this.isMoving = true;
      this.target = { x: this.x + 16, y: this.y };
      this.velocityX = 1;
      this.setFlipX(false);
    } else if (this.keys.get('LEFT').isDown) {
      this.isMoving = true;
      this.target = { x: this.x - 16, y: this.y };
      this.velocityX = -1;

      this.setFlipX(true);
    } else if (this.keys.get('DOWN').isDown) {
      this.isMoving = true;
      this.target = { x: this.x, y: this.y + 16 };
      this.velocityY= +1;
    } else if (this.keys.get('UP').isDown) {
      this.isMoving = true;
      this.target = { x: this.x, y: this.y - 16 };
      this.velocityY=-1;
    }
  }
}
