import { SpellRepository } from '../repositories/SpellRepository';
import { Spell } from '../../components/battle/CombatDataStructures';
import { EffectsRepository } from '../repositories/EffectRepository';

export class SpellController {
    private spellRepository: SpellRepository;
    private effectsRepository: EffectsRepository
    constructor(game: Phaser.Game) {
        this.spellRepository = new SpellRepository(game);
        this.effectsRepository = new EffectsRepository(game);
    }
    getSpellById(id: number): Spell {

        const spellFromDB = this.spellRepository.getById(id);
        const effect = this.effectsRepository.getById(spellFromDB.animationEffect)

        const primaryAnimationEffect = spellFromDB.primaryAnimationEffect && this.effectsRepository.getById(spellFromDB.primaryAnimationEffect)
        const spellToReturn = {
            ...spellFromDB,
            primaryAnimationEffect: primaryAnimationEffect, 
            animationEffect: effect,
        }
        return spellToReturn;
    }
}
