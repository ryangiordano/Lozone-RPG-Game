import { Directions, createThrottle } from "../../Utility";
import { Cast } from "../../../assets/objects/Cast";

export class Entity extends Phaser.GameObjects.Sprite {
  protected currentMap: Phaser.Tilemaps.Tilemap;
  protected currentScene: Phaser.Scene;
  protected currentTile: Phaser.Tilemaps.Tile;
  // TODO: Refactor how we store casts locally, this sucks.
  protected casts: Phaser.GameObjects.Group;
  constructor({ scene, x, y, key, map, casts }) {
    super(scene, x, y, key);
    this.casts = casts;
    this.currentScene = scene;
    this.currentMap = map;
    this.currentScene.add.existing(this);
    this.initSprite();
    this.currentTile = this.getTileBelowFoot();
    this.currentTile.properties["collide"] = true;
  }
  private initSprite() {
    this.setOrigin(0.5, 0.5);
    this.setFlipX(false);
    this.currentScene.physics.world.enable(this);
  }
  protected getTileBelowFoot() {
    const tile = this.currentMap.getTileAt(
      Math.floor(this.x / 16),
      Math.floor(this.y / 16),
      true,
      "foreground"
    );
    return tile;
  }
}

export class Moveable extends Entity {
  protected isMoving = false;
  // TODO: Refactor this to be a state
  protected velocityX = 0;
  protected velocityY = 0;
  protected movementSpeed = 2;
  protected target = { x: 0, y: 0 };
  protected facing: Directions = Directions.down;
  constructor({ scene, x, y, key, map, casts }) {
    super({ scene, x, y, key, map, casts });
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
  protected moveToTarget() {
    if (this.x === this.target.x && this.y === this.target.y) {
      this.isMoving = false;
      this.queryUnderfoot();
    } else {
      if (this.x !== this.target.x) {
        this.x += this.velocityX;
      }
      if (this.y !== this.target.y) {
        this.y += this.velocityY;
      }
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
    const backgroundTile = this.currentMap.getTileAt(
      marker.x,
      marker.y,
      true,
      "background"
    );
    const foregroundTile = this.currentMap.getTileAt(
      marker.x,
      marker.y,
      true,
      "foreground"
    );
    if (
      this.currentMap.hasTileAt(marker.x, marker.y, "background") &&
      (backgroundTile &&
        !backgroundTile.properties["collide"] &&
        (foregroundTile && !foregroundTile.properties["collide"]))
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
        this.currentTile.properties["collide"] = false;
        this.currentTile = foregroundTile;
        this.currentTile.properties["collide"] = true;
      }
    } else {
      this.anims.stop();
      this.face(direction);
      this.emit("hit-wall");
    }
  }
  public queryObject = createThrottle(300, () => {
    const coords = this.getTileInFront();
    this.casts.add(
      new Cast({
        scene: this.currentScene,
        x: coords.x,
        y: coords.y
      })
    );
  });

  public queryUnderfoot = createThrottle(100, () => {
    this.casts.add(
      new Cast({
        scene: this.currentScene,
        x: this.x,
        y: this.y,
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
}

export class Controllable {
  private keys: Map<string, Phaser.Input.Keyboard.Key>;
  public canInput = true;
  constructor(private scene: Phaser.Scene, private moveable: Moveable) {
    this.keys = new Map([
      ["LEFT", this.addKey("LEFT")],
      ["RIGHT", this.addKey("RIGHT")],
      ["DOWN", this.addKey("DOWN")],
      ["UP", this.addKey("UP")],
      ["SPACE", this.addKey("SPACE")]
    ]);
  }
  private addKey(key: string): Phaser.Input.Keyboard.Key {
    return this.scene.input.keyboard.addKey(key);
  }
  public handleInput() {
    if (this.keys.get("RIGHT").isDown) {
      this.moveable.setFlipX(true);
      this.moveable.move(Directions.right, () =>
        this.moveable.anims.play("walkV", true)
      );
    } else if (this.keys.get("LEFT").isDown) {
      this.moveable.setFlipX(false);
      this.moveable.move(Directions.left, () =>
        this.moveable.anims.play("walkV", true)
      );
    } else if (this.keys.get("DOWN").isDown) {
      this.moveable.move(Directions.down, () =>
        this.moveable.anims.play("walkDown", true)
      );
    } else if (this.keys.get("UP").isDown) {
      this.moveable.move(Directions.up, () =>
        this.moveable.anims.play("walkUp", true)
      );
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.get("SPACE"))) {
      this.moveable.queryObject();
    }
  }
}
