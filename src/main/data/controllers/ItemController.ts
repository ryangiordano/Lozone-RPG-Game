import { ItemRepository } from "../repositories/ItemRepository";
import { Item, ItemCategory } from "../../components/entities/Item";
import { SpellController } from "./SpellController";

export class ItemController {
  private itemRepository: ItemRepository;
  private spellController: SpellController;
  constructor(game: Phaser.Game) {
    this.itemRepository = new ItemRepository(game);
    this.spellController = new SpellController(game);
  }
  getItem(id): Item {
    const item = this.itemRepository.getById(id);
    const spellEffect =
      item.spellId && this.spellController.getSpellById(item.spellId);
    const itemCategory = ItemCategory[item.category];
    return new Item(
      item.id,
      item.name,
      item.description,
      spellEffect,
      item.effectPotency,
      item.spriteKey,
      item.frame,
      itemCategory,
      1,
      item.sound,
      item.flagId,
      item.placementFlags
    );
  }
}
