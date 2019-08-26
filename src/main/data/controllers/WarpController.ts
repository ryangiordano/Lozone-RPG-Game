import { WarpRepository } from '../repositories/WarpRepository';
import { LocationRepository, LocationData } from '../repositories/LocationRepository';

export interface Warp {
    id: number,
    warpId: number,
    warpDestId: number,
    destinationLocation: LocationData
}

export class WarpController {
    private warpRepository: WarpRepository;
    private locationRepository: LocationRepository;
    /**
     * Retrieve warp points from the database.
     */
    constructor(game: Phaser.Game) {
        this.warpRepository = new WarpRepository(game);
        this.locationRepository = new LocationRepository(game);
    }
    public getWarpById(id: number): Warp {
        const warp = this.warpRepository.getById(id);
        const location = this.locationRepository.getById(warp.destinationLocationId);
        return {
            ...warp,
            warpId: id,
            destinationLocation: location,
        };
    }
    public getWarpByDestId(warpDestId: number): Warp {
        const warp = this.warpRepository.getByWarpDestination(warpDestId);
        const location = this.locationRepository.getById(warp.destinationLocationId);
        return {
            ...warp,
            warpId: warp.id,
            destinationLocation: location
        }
    }
}