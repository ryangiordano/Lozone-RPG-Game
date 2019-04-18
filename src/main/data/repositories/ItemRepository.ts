import { Item } from "../../components/entities/Item";

export class ItemRepository {
  /**
   * Holds a reference to the item DB
   */
  private itemsFromDB;
  private playerContents: Item[];
  constructor(items) {
    this.itemsFromDB = items;
    this.playerContents = [];
  }
  addItemToPlayerContents(id: number): Item {
    const itemToAdd = this.getItem(id);
    const itemInInventory = this.getItemOnPlayer(id);
    if (itemInInventory) {
      itemInInventory.incrementQuantity();
    } else {
      this.playerContents.push(itemToAdd);
    }
    return itemToAdd;
  }
  removeItemFromPlayerContents(id) {
    const toRemoveIdx = this.playerContents.findIndex(item => item.id === id);
    const toRemove = this.playerContents[toRemoveIdx];
    if (toRemove) {
      if (toRemove.quantity <= 1) {
        this.playerContents.splice(toRemoveIdx, 1);
      } else {
        toRemove.decrementQuantity();
      }
    }
  }
  consumeItem(id) {
    const item = this.getItem(id);
    this.removeItemFromPlayerContents(id);
  }
  getItem(id: string | number): Item {
    const itemFromDB = this.itemsFromDB.items[id];
    if (itemFromDB) {
      const item = new Item(
        id,
        itemFromDB.name,
        itemFromDB.description,
        itemFromDB.effectId,
        itemFromDB.effectPotency,
        itemFromDB.spriteKey,
        itemFromDB.frame,
        itemFromDB.category
      );
      return item;
    } else {
      console.error('If an item does not appear in our records, it does not exist!');
    }
  }
  getItemsOnPlayer(): Item[] {
    return this.playerContents;
  }
  getItemOnPlayer(id): Item {
    return this.playerContents.find(item => item.id === id);
  }
  getItemsOnPlayerByCategory(category: string): Item[] {
    return this.playerContents.filter(item => item.category === category);
  }
}
