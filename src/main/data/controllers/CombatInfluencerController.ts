import { EffectsRepository } from "../repositories/EffectRepository";
import { EnchantmentRepository } from "../repositories/CombatInfluencerRepository";
import {
  BuffRepository,
  ModifierRepository,
} from "../repositories/CombatInfluencerRepository";
export class CombatInfluencerController {
  private buffRepository: BuffRepository;
  private modifierRepository: ModifierRepository;
  private effectsRepository: EffectsRepository;
  private enchantmentRepository: EnchantmentRepository;
  /**
   * Returns buffs which hold arrays of modifiers.
   */
  constructor(game: Phaser.Game) {
    this.buffRepository = new BuffRepository(game);
    this.effectsRepository = new EffectsRepository(game);
    this.modifierRepository = new ModifierRepository(game);
    this.enchantmentRepository = new EnchantmentRepository(game);
  }
  getBuff(id: number) {
    const buff = this.buffRepository.getById(id);
    const mappedBuff = {
      ...buff,
      effect: this.effectsRepository.getById(buff.effect),
      modifiers: buff.modifiers.map((m) => this.modifierRepository.getById(m)),
      enchantments: buff.enchantments
        ? buff.enchantments.map((e) => this.enchantmentRepository.getById(e))
        : [],
    };
    return mappedBuff;
  }
}
