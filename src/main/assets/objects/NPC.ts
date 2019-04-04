import { Directions, createThrottle } from '../../utility/Utility';
import { Moveable } from './Moveable';
import { Cast } from './Cast';

export class NPC extends Phaser.GameObjects.Sprite {
  private currentMap: Phaser.Tilemaps.Tilemap;
  private currentScene: Phaser.Scene;
  private isMoving = false;
  private messages: string[];
  private velocityX = 0;
  private velocityY = 0;
  private movementSpeed = 2;
  private target = { x: 0, y: 0 };
  private facing: Directions;
  private casts: Phaser.GameObjects.Group;
  public properties: any = {};
  private currentTile: Phaser.Tilemaps.Tile;

  constructor(
    { scene, x, y, key, map, casts },
    message?: String,
    facing?: Directions
  ) {
    super(scene, x, y, key);
    this.casts = casts;
    this.currentScene = scene;
    this.currentMap = map;
    this.currentScene.add.existing(this);
    this.initSprite();
    this.properties.type = 'interactive';
    this.properties.message = message;
    this.face(facing);
    this.currentTile = this.getTileBelowFoot();
    this.currentTile.properties['collide'] = true;
  }

  update(): void {
    if (this.isMoving) {
      this.moveToTarget();
    }
  }
  private initSprite() {
    this.setOrigin(0.5, 0.5);
    this.setFlipX(false);
    this.currentScene.physics.world.enable(this);
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

  private getTileBelowFoot() {
    const tile = this.currentMap.getTileAt(
      Math.floor(this.x / 16),
      Math.floor(this.y / 16),
      true,
      'foreground'
    );
    return tile;
  }

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
}
