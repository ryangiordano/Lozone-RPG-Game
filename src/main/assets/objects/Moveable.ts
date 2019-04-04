import { Directions } from '../../utility/Utility';
import { Cast } from './Cast';
import { createThrottle } from '../../utility/Utility';

export class Moveable extends Phaser.GameObjects.Sprite {
  constructor({ scene, x, y, key, map, casts }){
    super(scene, x, y, key);
    this.casts = casts;
    this.currentScene = scene;
    this.currentMap = map;
    this.currentScene.add.existing(this);
    this.initSprite();
  }
    // TODO: Refactor this into a base class
  // Provide API to allow programatic movement
  protected currentMap: Phaser.Tilemaps.Tilemap;
  protected currentScene: Phaser.Scene;
  protected keys: Map<string, Phaser.Input.Keyboard.Key>;

  protected isMoving = false;
  // TODO: Refactor this to be a state
  protected canInput: boolean = true;
  protected velocityX = 0;
  protected velocityY = 0;
  protected movementSpeed = 2;
  protected target = { x: 0, y: 0 };
  protected facing: Directions = Directions.down;
  // TODO: Refactor how we store casts locally, this sucks.
  protected casts: Phaser.GameObjects.Group;  

  private initSprite() {
    this.setOrigin(0.5, 0.5);
    this.setFlipX(false);
    this.keys = new Map([
      ['LEFT', this.addKey('LEFT')],
      ['RIGHT', this.addKey('RIGHT')],
      ['DOWN', this.addKey('DOWN')],
      ['UP', this.addKey('UP')],
      ['SPACE', this.addKey('SPACE')]
    ]);

    this.currentScene.physics.world.enable(this);

    this.currentScene.events.on('update', this.update);
  }
  private addKey(key: string): Phaser.Input.Keyboard.Key {
    return this.currentScene.input.keyboard.addKey(key);
  }
  protected moveToTarget() {
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
  public face(direction: Directions) {
    this.facing = direction;
    switch (direction) {
      case Directions.up:
        this.setFrame(3);
        break;
      case Directions.left:
        this.setFrame(7);
        break;
      case Directions.right:
        this.setFrame(7);
        break;
      default:
        this.setFrame(0);
    }
  }
  public move(direction: Directions, callback: Function, spaces?: number) {
    this.facing = direction;
    this.target = this.getTileInFront();
    this.handleMovement(this.facing, callback);
  }
  protected handleMovement(direction: Directions, callback?: Function) {
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
    // Will get exponentially more expensive the more layers are added.
    // Maybe we can store a flattened map somewhere?
    if (
      this.currentMap.hasTileAt(marker.x, marker.y, 'background') &&
      (tile &&
        !tile.properties['collide'] &&
        (tile2 && !tile2.properties['collide']))
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
      if (callback) {
        callback();
      }
    } else {
      this.anims.stop();
      this.face(direction);
    }
  }
  protected queryObject = createThrottle(300, () => {
    const coords = this.getTileInFront();
    this.casts.add(
      new Cast({
        scene: this.currentScene,
        x: coords.x,
        y: coords.y
      })
    );
  });

  protected getTileInFront(): { x: number; y: number } {
    switch (this.facing) {
      case Directions.right:
        return { x: this.x + 16, y: this.y };
      case Directions.left:
        return { x: this.x - 16, y: this.y };
      case Directions.down:
        return { x: this.x, y: this.y + 16 };
      default:
        return { x: this.x, y: this.y - 16 };
    }
  }
  public setCanInput(bool: boolean) {
    this.canInput = bool;
  }
  protected handleInput() {
    if (this.keys.get('RIGHT').isDown) {
      this.setFlipX(true);
      this.move(Directions.right, () => this.anims.play('walkV', true));
    } else if (this.keys.get('LEFT').isDown) {
      this.setFlipX(false);
      this.move(Directions.left, () => this.anims.play('walkV', true));
    } else if (this.keys.get('DOWN').isDown) {
      this.move(Directions.down, () => this.anims.play('walkDown', true));
    } else if (this.keys.get('UP').isDown) {
      this.move(Directions.up, () => this.anims.play('walkUp', true));
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.get('SPACE'))) {
      this.queryObject();
    }
  }
}
