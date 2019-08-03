import { Item } from '../../components/entities/Item';
export class PlayerContents {
  private contents: Item[] = [];
  constructor() { }
  addItemToContents(itemToAdd: Item) {
    const itemInInventory = this.getItemOnPlayer(itemToAdd);
    if (itemInInventory) {
      itemInInventory.incrementQuantity();
    } else {

      this.contents.push(itemToAdd);
    }
  }
  removeItemFromContents(itemToRemove: Item): boolean {
    const toRemoveIdx = this.contents.findIndex(item => item.id === itemToRemove.id);
    const toRemove = this.contents[toRemoveIdx];
    if (toRemove) {
      if (toRemove.quantity <= 1) {
        this.contents.splice(toRemoveIdx, 1);
      }
      else {
        toRemove.decrementQuantity();
      }
      return true;
    }
    return false;
  }
  consumeItem(item: Item) {
    this.removeItemFromContents(item);
  }
  getItemOnPlayer(itemToGet: Item): Item {
    return this.contents.find(item => item.id === itemToGet.id);
  }
  getItemsOnPlayer(): Item[] {
    return this.contents;
  }
  getItemsOnPlayerByCategory(category: string): Item[] {
    return this.contents.filter(item => item.category === category);
  }
}
