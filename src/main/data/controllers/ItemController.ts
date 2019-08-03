import { ItemRepository } from "../repositories/ItemRepository";
import { Item } from "../../components/entities/Item";
import { EffectsRepository } from "../repositories/EffectRepository";

export class ItemController {
  private itemRepository: ItemRepository;
  private effectsRepository: EffectsRepository;
  constructor(game: Phaser.Game) {
    this.itemRepository = new ItemRepository(game);
    this.effectsRepository = new EffectsRepository(game);
  }
  getItem(id): Item {
    const item = this.itemRepository.getById(id);
    const effect = this.effectsRepository.getById(item.effectId);
    console.log(effect)
    return new Item(
      item.id,
      item.name,
      item.description,
      effect,
      item.effectPotency,
      item.spriteKey,
      item.frame,
      item.category,
      1
    );
  }
}
