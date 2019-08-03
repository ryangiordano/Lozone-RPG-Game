import { createThrottle, Directions } from "../../utility/Utility";
import {
  Moveable,
  Controllable
} from "../../components/entities/Movement";

export class Player extends Moveable {
  public controllable: Controllable;
  constructor({ scene, x, y, key, map, casts }) {
    super({ scene, x, y, key, map, casts });
    this.controllable = new Controllable(scene, this);
    this.on("hit-wall", this.playBump);
  }
  // TODO: Emit that the player bumped rather than handling playing sounds
  // From the player.
  private playBump = createThrottle(300, () => {
    this.scene.sound.play("bump", {volume:.1});
  });

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
