import { createThrottle, Directions } from "../../utility/Utility";
import {
  Moveable,
  Controllable
} from "./Movement";
import { EntityTypes } from "./Entity";

export class Player extends Moveable {
  public controllable: Controllable;
  constructor({ scene, x, y, key }) {
    super({ scene, x, y, key });
    this.controllable = new Controllable(scene, this);
    this.entityType = EntityTypes.player;
    this.on("hit-wall", this.playBump);
  }
  // TODO: Emit that the player bumped rather than handling playing sounds
  // From the player.
  private playBump = createThrottle(300, () => {
    this.scene.sound.play("bump", { volume: .1 });
  });
  protected async setCollideOnTileBelowFoot(toCollide: boolean) {
    const tile = this.getTileBelowFoot();
    tile.properties["collide"] = toCollide;
  }

  update(): void {
    if (this.isMoving) {
      this.moveToTarget();
    } else {
      if (this.controllable.canInput) {
        this.controllable.handleInput();
      }
    }
  }
}
