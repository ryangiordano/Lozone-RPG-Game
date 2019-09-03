import { ItemRepository } from "../repositories/ItemRepository";
import { Item, ItemCategory } from "../../components/entities/Item";
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
    const effect = item.effectId && this.effectsRepository.getById(item.effectId);
    const itemCategory = ItemCategory[item.category]
    return new Item(
      item.id,
      item.name,
      item.description,
      effect,
      item.effectPotency,
      item.spriteKey,
      item.frame,
      itemCategory,
      1,
      item.collectSound
    );
  }
}
