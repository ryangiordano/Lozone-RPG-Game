import { FlagRepository } from "../repositories/FlagRepository";
import { FlagTypes } from '../../utility/state/FlagModule';

export class FlagController {
    private flagRepository: FlagRepository;
    constructor(game: Phaser.Game) {
        this.flagRepository = new FlagRepository(game)

    }
    getAllFlags() {
        return this.flagRepository.getAllAsMap();
    }

    getFlagById(id: number) {
        return this.flagRepository.getById(id);
    }
    getFlagsByType(type: FlagTypes) {
        return this.flagRepository.getAll().filter(flag => flag.type === type)
    }

}