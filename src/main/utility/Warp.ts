import { WarpController } from "../data/controllers/WarpController";

export class WarpUtility {
    private warpController: WarpController;
    /**
     * A utility for handling warping between maps/scenes.
     */
    constructor(private scene: Phaser.Scene) {
        this.warpController = new WarpController(this.scene.game);
    }

    public warpTo(warpDestinationId: number) {
        console.log(warpDestinationId)
        const { scene, map, tileset, warpId, warpDestId, enemyPartyIds } = this.warpController.getWarpByDestId(warpDestinationId);
        this.scene.scene.start(scene, {
            map,
            tileset,
            warpId,
            warpDestId,
            enemyPartyIds
        })
    }
}