import { Item, ItemCategory } from '../../components/entities/Item';
export class PlayerContents {
  private contents: Item[] = [];
  private coins: number = 0;
  constructor() { }
  addItemToContents(itemToAdd: Item) {
    const itemInInventory = this.getItemOnPlayer(itemToAdd.id);
    if (itemInInventory) {
      itemInInventory.incrementQuantity();
    } else {

      this.contents.push(itemToAdd);
    }
  }
  getCoins() {
    return this.coins;
  }
  addCoins(amount) {
    this.coins += amount;
  }
  removeCoins(amount) {
    this.coins = Math.max(0, this.coins - amount);
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
  getItemOnPlayer(id: number | string): Item {
    return this.contents.find(item => item.id === id);
  }
  getItemsOnPlayer(): Item[] {
    return this.contents;
  }
  getItemsOnPlayerByCategory(category: ItemCategory): Item[] {
    return this.contents.filter(item => item.category === category);
  }
}
