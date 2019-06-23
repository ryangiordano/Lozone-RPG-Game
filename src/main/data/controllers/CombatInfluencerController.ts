import { BuffRepository, ModifierRepository } from '../repositories/CombatInfluencerRepository';
export class BuffController {
    private buffRepository: BuffRepository;
    private modifierRepository: ModifierRepository;
    /**
     * Returns buffs which hold arrays of modifiers.
     */
    constructor(game: Phaser.Game) {
        this.buffRepository = new BuffRepository(game);
        this.modifierRepository = new ModifierRepository(game);
    }
    getBuff(id:number){
        const buff = this.buffRepository.getById(id);
        console.log(buff)

    }
}