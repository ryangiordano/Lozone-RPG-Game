import { Entity } from "./Entity";
/**
 * Performs an action or flips a flag when the character steps on it.
 *
 */
export class Trigger extends Entity {
  //TODO: Implement this in game.  Currently there isn't anything in game using a trigger...;
  constructor({ scene, x, y }) {
    super({ scene, x, y, key: null });
    this.displayWidth = 16;
    this.displayHeight = 16;
    this.visible = false;
  }
}
