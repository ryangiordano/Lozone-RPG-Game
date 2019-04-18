import { ItemRepository } from "../repositories/ItemRepository";
import { Item } from "../../components/entities/Item";

export class ItemController {
  private itemRepository: ItemRepository;
  constructor(game: Phaser.Game) {
    this.itemRepository = new ItemRepository(game);
  }
  getItem(id): Item {
    return this.itemRepository.getById(id);
  }

}
