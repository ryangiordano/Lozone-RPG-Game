class Item {
  private limit = 99;
  constructor(
    public id: number | string,
    public name: string,
    public description: string,
    public effectId: number,
    public effectPotency: number,
    public spriteKey: string,
    public frame: number,
    public category: string,
    public quantity?: number
  ) {}
  incrementQuantity() {
    if (this.quantity >= this.limit) {
      this.quantity = this.quantity;
    } else {
      this.quantity++;
    }
  }
  decrementQuantity() {
    if (this.quantity <= 0) {
      this.quantity = this.quantity;
    } else {
      this.quantity--;
    }
  }
  setQuantity(amount: number) {
    this.quantity = amount;
  }
}
export class ItemModule {
  /**
   * Holds a reference to the item DB
   */
  private itemsFromDB;
  private playerContents: Item[];
  constructor(items) {
    this.itemsFromDB = items;
    this.playerContents = [];
  }
  addItemToPlayerContents(id:number): Item {
    const itemToAdd = this.getItem(id);
    const itemInInventory = this.getItemOnPlayer(id);
    if(itemInInventory){
      itemInInventory.incrementQuantity();
    }else{
      this.playerContents.push(itemToAdd);
    }
    return itemToAdd;
  }
  removeItemFromPlayerContents(id) {
    const toRemoveIdx = this.playerContents.findIndex(item => item === id);
    const toRemove = this.playerContents[toRemoveIdx];
    if(toRemove){
      if(toRemove.quantity <=1){
        this.playerContents.splice(toRemoveIdx,1);
      }else{
        toRemove.decrementQuantity();
      }
    }
  }
  consumeItem(id){

  }
  getItem(id: string | number): Item {
    const item = this.itemsFromDB.items[id];
    if (item) {
      return new Item(
        id,
        item.name,
        item.description,
        item.effectId,
        item.effectPotency,
        item.spriteKey,
        item.frame,
        item.category
      );
    } else {
      console.error('If an item does not appear in our records, it does not exist!');
    }
  }
  getItemOnPlayer(id): Item {
    return this.playerContents.find(item=>item.id===id);
  }
  getItemsOnPlayerByCategory(category: string): Item[] {
    return this.playerContents.filter(item=>item.category===category);
  }
}
