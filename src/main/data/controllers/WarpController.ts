import { WarpRepository, Warp } from '../repositories/WarpRepository';
export class WarpController {
    private warpRepository: WarpRepository;
    /**
     * Retrieve warp points from the database.
     */
    constructor(game: Phaser.Game) {
        this.warpRepository = new WarpRepository(game);
    }
    public getWarpById(id: number): Warp {
        const warp = this.warpRepository.getById(id);
        return {
            ...warp,
            warpId: id
        };
    }
    public getWarpByDestId(warpDestId: number): Warp {
        const warp = this.warpRepository.getByWarpDestination(warpDestId);
        return {
            ...warp,
            warpId: warp.id
        }
    }
}