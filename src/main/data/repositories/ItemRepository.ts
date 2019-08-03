import { ItemData } from "../../components/entities/Item";
import { Repository } from "./Repository";

export class ItemRepository extends Repository<ItemData>{
  constructor(game) {
    const items = game.cache.json.get('items');
    super(items);
  }
  
}
