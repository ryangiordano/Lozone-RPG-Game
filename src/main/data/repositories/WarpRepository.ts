import { Repository } from "./Repository";
export interface WarpData {
  id: number;
  warpId: number;
  warpDestId: number;
  destinationLocationId: number;
  placementFlags?: number[];
}

export class WarpRepository extends Repository<WarpData> {
  /**
   * Get warps from the database by warpId or destination.
   */
  constructor(game: Phaser.Game) {
    const warps = game.cache.json.get("warps");
    super(warps);
  }

  public getByWarpDestination(warpDestId: number) {
    return this.getAll().find((warp) => warp.warpDestId === warpDestId);
  }
}
