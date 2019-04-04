import { Moveable } from './Moveable';
import { createThrottle, Directions } from '../../utility/Utility';
import { Cast } from './Cast';

export class Player extends Phaser.GameObjects.Sprite {
  // TODO: Refactor this into a base class
  // Provide API to allow programatic movement
  private currentMap: Phaser.Tilemaps.Tilemap;
  private currentScene: Phaser.Scene;
  private keys: Map<string, Phaser.Input.Keyboard.Key>;

  private isMoving = false;
  // TODO: Refactor this to be a state
  private canInput: boolean = true;
  private velocityX = 0;
  private velocityY = 0;
  private movementSpeed = 2;
  private target = { x: 0, y: 0 };
  private facing: Directions = Directions.down;
  private currentTile: Phaser.Tilemaps.Tile;
  // TODO: Refactor how we store casts locally, this sucks.
  private casts: Phaser.GameObjects.Group;
  constructor({ scene, x, y, key, map, casts }) {
    super(scene, x, y, key);
    this.casts = casts;
    this.currentScene = scene;
    this.currentMap = map;
    this.currentScene.add.existing(this);
    this.initSprite();
    this.currentTile = this.getTileBelowFoot();
    this.currentTile.properties['collide'] = true;
  }

  // TODO: Emit that the player bumped rather than handling playing sounds
  // From the player.
  private playBump = createThrottle(300, () => {
    this.scene.sound.play('bump');
  });

  update(): void {
    if (this.isMoving) {
      this.moveToTarget();
    } else {
      if (this.canInput) {
        this.handleInput();
      }
    }
  }

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
  }

  private addKey(key: string): Phaser.Input.Keyboard.Key {
    return this.currentScene.input.keyboard.addKey(key);
  }
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
  private handleMovement(direction: Directions, callback?: Function) {
    const marker = { x: null, y: null };
    marker.x = Math.floor(this.target.x / 16);
    marker.y = Math.floor(this.target.y / 16);
    const bgTile = this.currentMap.getTileAt(
      marker.x,
      marker.y,
      true,
      'background'
    );
    const fgTile = this.currentMap.getTileAt(
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
      (bgTile &&
        !bgTile.properties['collide'] &&
        (fgTile && !fgTile.properties['collide']))
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
      if (this.currentTile) {
        this.currentTile.properties['collide'] = false;
        this.currentTile = fgTile;
        this.currentTile.properties['collide'] = true;
      }
    } else {
      this.anims.stop();
      this.face(direction);
    }
  }
  private getTileBelowFoot() {
    const tile = this.currentMap.getTileAt(
      Math.floor(this.x / 16),
      Math.floor(this.y / 16),
      true,
      'foreground'
    );
    return tile;
  }
  private queryObject = createThrottle(300, () => {
    const coords = this.getTileInFront();
    this.casts.add(
      new Cast({
        scene: this.currentScene,
        x: coords.x,
        y: coords.y
      })
    );
  });

  private getTileInFront(): { x: number; y: number } {
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
  private handleInput() {
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
