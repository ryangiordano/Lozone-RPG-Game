import { SpellRepository } from "../repositories/SpellRepository";
import { Spell } from "../../components/battle/CombatDataStructures";
import { EffectsRepository } from "../repositories/EffectRepository";
import { CombatInfluencerController } from "./CombatInfluencerController";

export class SpellController {
  private spellRepository: SpellRepository;
  private effectsRepository: EffectsRepository;
  private combatInfluencerController: CombatInfluencerController;
  constructor(game: Phaser.Game) {
    this.spellRepository = new SpellRepository(game);
    this.effectsRepository = new EffectsRepository(game);
    this.combatInfluencerController = new CombatInfluencerController(game);
  }
  getSpellById(id: number): Spell {
    const spellFromDB = this.spellRepository.getById(id);
    const effect = this.effectsRepository.getById(spellFromDB.animationEffect);

    const primaryAnimationEffect =
      spellFromDB.primaryAnimationEffect &&
      this.effectsRepository.getById(spellFromDB.primaryAnimationEffect);

    const appliedBuffs = spellFromDB.appliedBuffs
      ? spellFromDB.appliedBuffs.map((ab) => {
          return this.combatInfluencerController.getBuff(ab);
        })
      : [];

    const spellToReturn = {
      ...spellFromDB,
      primaryAnimationEffect: primaryAnimationEffect,
      animationEffect: effect,
      appliedBuffs,
    };
    return spellToReturn;
  }
}
