import { Entity, EntityTypes } from "./Entity";
import { State } from "../../utility/state/State";

/**
 * Carries data for warping to different maps.
 */
export class WarpTrigger extends Entity {
  public warpId: number;
  public entityType = EntityTypes.warp;
  public event;
  public placementFlags;
  constructor({ scene, x, y, warpId, key = null, event, placementFlags }) {
    super({ scene, x, y, key });
    this.event = event;
    this.placementFlags = placementFlags;
    this.warpId = warpId;
    this.visible = false;
    this.setAlpha(1);
    this.setCollideOnTileBelowFoot(false);

    const sm = State.getInstance();
    const notYetFlagggedToPlace = !sm.allAreFlagged(this.placementFlags || []);
    const unPlaced = Boolean(this.placementFlags) && notYetFlagggedToPlace;
    this.setPlaced(!unPlaced);
  }
  public setPlaced(placed: boolean) {
    this.setActive(placed);
    this.setCollideOnTileBelowFoot(false);
  }
}

export class Warp extends WarpTrigger {
  constructor({ scene, x, y, warpId, event, placementFlags }) {
    super({ scene, x, y, warpId, key: "warp-tile", event, placementFlags });
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
