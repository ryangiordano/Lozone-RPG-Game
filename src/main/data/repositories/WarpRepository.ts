import { Repository } from './Repository';

export interface Warp {
    id: number,
    warpId: number,
    warpDestId: number,
    description: string,
    scene: string,
    tileset: string,
    map: string,
    enemyPartyIds?: number[]
}

export class WarpRepository extends Repository<Warp> {
    /**
     * Get warps from the database by warpId or destination.
     */
    constructor(game: Phaser.Game) {
        const warps = game.cache.json.get('warps');
        super(warps);
    }

    public getByWarpDestination(warpDestId: number){
        return this.getAll().find(warp=>warp.warpDestId === warpDestId);
    }
}