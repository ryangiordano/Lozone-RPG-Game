import { Item } from "../../components/entities/Item";
import { Repository } from "./Repository";

export class ItemRepository extends Repository<Item>{
  constructor(game) {
    const items = game.cache.json.get('items');
    super(items);
  }
  
}
