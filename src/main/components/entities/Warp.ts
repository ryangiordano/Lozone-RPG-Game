import { Entity, EntityTypes } from "./Entity";

/**
 * Carries data for warping to different maps.
 */
export class WarpTrigger extends Entity {
  public warpId: number;
  public properties: any;

  constructor({ scene, x, y, warpId, key = null, properties }) {
    super({ scene, x, y, key });
    this.properties = properties;

    this.warpId = warpId;
    this.visible = false;
    this.setAlpha(1);
    this.entityType = EntityTypes.warp;
    this.setCollideOnTileBelowFoot(false);
  }
  public setPlaced(placed: boolean) {
    this.setActive(placed);
    this.setCollideOnTileBelowFoot(false);
  }
}

export class Warp extends WarpTrigger {
  constructor({ scene, x, y, warpId, properties }) {
    super({ scene, x, y, warpId, key: "warp-tile", properties });
    this.visible = true;
    this.anims.play("warp-tile");
  }
  public setPlaced(placed: boolean) {
    this.setActive(placed);
    this.setVisible(placed);
    this.setCollideOnTileBelowFoot(false);
  }
}

/**
 * A fallback object for maps where the warp endpoint is not explicitly set.
 */
export class Spawn extends Entity {
  constructor({ scene, x, y }) {
    super({ scene, x, y, key: null });
    this.entityType = EntityTypes.spawn;
    this.visible = false;
    this.setCollideOnTileBelowFoot(false);
  }
}
