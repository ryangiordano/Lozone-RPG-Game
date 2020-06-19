import {
  EquipmentSlot,
  EquipmentType,
} from "./../../components/entities/Items/Equipment";
import {
  EquipmentRepository,
  ItemData,
  EquipmentData,
} from "./../repositories/ItemRepository";
import { ItemRepository } from "../repositories/ItemRepository";
import { Item, ItemCategory } from "../../components/entities/Items/Item";
import { SpellController } from "./SpellController";
import { Equipment } from "../../components/entities/Items/Equipment";

export class ItemController {
  private itemRepository: ItemRepository;
  private equipmentRepository: EquipmentRepository;
  private spellController: SpellController;
  private jointRepos;
  constructor(game: Phaser.Game) {
    this.itemRepository = new ItemRepository(game);
    this.spellController = new SpellController(game);
    this.equipmentRepository = new EquipmentRepository(game);
  }
  getItem(id): Item {
    const item = this.itemRepository.exists(id)
      ? this.itemRepository.getById(id)
      : this.equipmentRepository.getById(id);

    const spellEffect =
      item.spellId && this.spellController.getSpellById(item.spellId);
    const itemCategory = ItemCategory[item.category];

    if (itemCategory === ItemCategory.equipment) {
      const slot = EquipmentSlot[item.slot];
      const equipmentType = EquipmentType[item.equipmentType];
      return new Equipment(
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
        item.placementFlags,
        slot,
        equipmentType,
        item.classes,
        item.characters,
        item.modifiers
      );
    }
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
