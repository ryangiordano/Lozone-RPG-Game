enum Directions {
  up,
  down,
  left,
  right
}
import { createThrottle } from '../../utility/Utility';

export class Lo extends Phaser.GameObjects.Sprite {
  private currentMap: Phaser.Tilemaps.Tilemap;
  private currentScene: Phaser.Scene;
  private keys: Map<string, Phaser.Input.Keyboard.Key>;
  private isMoving = false;
  private velocityX = 0;
  private velocityY = 0;
  private movementSpeed = 2;
  private target = { x: 0, y: 0 };
  // TODO: Emit that the player bumped rather than handling playing sounds
  // From the player.
  private playBump = createThrottle(300, () => {
    this.scene.sound.play('bump');
  });

  constructor({ scene, x, y, key, map }) {
    super(scene, x, y, key);
    this.currentScene = scene;
    this.currentMap = map;
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
  // TODO: Refactor this into a base class
  // Provide API to allow programatic movement
  private moveToTarget() {
    if (this.x === this.target.x && this.y === this.target.y) {
      this.isMoving = false;
    } else {
      if (this.x !== this.target.x) {
        this.x += this.velocityX;
      }
      if (this.y !== this.target.y) {
        this.y += this.velocityY;
      }
    }
  }
  private handleMovement(direction: Directions) {
    const marker = { x: null, y: null };
    marker.x = Math.floor(this.target.x / 16);
    marker.y = Math.floor(this.target.y / 16);
    const tile = this.currentMap.getTileAt(
      marker.x,
      marker.y,
      true,
      'background'
    );
    const tile2 = this.currentMap.getTileAt(
      marker.x,
      marker.y,
      true,
      'foreground'
    );
    // TODO: Should handle this with one call, instead of two separate calls to two different layers.
    // Maybe we can store a flattened map somewhere?
    if (
      tile &&
      !tile.properties['collide'] &&
      (tile2 && !tile2.properties['collide'])
    ) {
      this.isMoving = true;
      const movementSpeed =
        direction === Directions.right || direction === Directions.down
          ? +this.movementSpeed
          : -this.movementSpeed;
      if (direction === Directions.right || direction === Directions.left) {
        this.velocityX = movementSpeed;
      } else {
        this.velocityY = movementSpeed;
      }
    } else {
      this.playBump();
    }
  }
  private handleInput() {
    if (this.keys.get('RIGHT').isDown) {
      this.target = { x: this.x + 16, y: this.y };
      this.handleMovement(Directions.right);
      this.setFlipX(false);
    } else if (this.keys.get('LEFT').isDown) {
      this.target = { x: this.x - 16, y: this.y };
      this.handleMovement(Directions.left);
      this.setFlipX(true);
    } else if (this.keys.get('DOWN').isDown) {
      this.target = { x: this.x, y: this.y + 16 };
      this.handleMovement(Directions.down);
    } else if (this.keys.get('UP').isDown) {
      this.target = { x: this.x, y: this.y - 16 };
      this.handleMovement(Directions.up);
    }
  }
}
