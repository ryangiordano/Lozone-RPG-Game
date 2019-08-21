import { Repository } from "./Repository";

export interface LocationData {
    name: string,
    scene: string,
    tileset: string,
    map: string,
    enemyPartyIds: number[]
}


export class LocationRepository extends Repository<LocationData> {
  constructor(game: Phaser.Game) {
    const locations = game.cache.json.get('locations')
    super(locations);
  }
}
