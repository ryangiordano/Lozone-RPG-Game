import { DialogController } from '../../data/controllers/DialogController';
import { ItemController } from '../../data/controllers/ItemController';
import { Item } from '../../components/entities/Item';
import { ItemRepository } from '../../data/repositories/ItemRepository';
class FlagModule {
  private flagMap: Map<string, boolean>;
  constructor() {
    this.flagMap = new Map<string, boolean>();
  }
  public setFlag(key, flagged) {
    this.flagMap.set(key, flagged);
  }
  public setMultipleFlags(arr: any[]) {
    arr.forEach(el => {
      this.flagMap.set(el[0], el[1]);
    });
  }
  public isFlagged(key) {
    return this.flagMap.get(key);
  }
  public hasFlag(key) {
    return this.flagMap.has(key);
  }
}
class PlayerContents {
  private contents: Item[] = [];
  constructor() {

  }
  addItemToContents(itemToAdd: Item): Item {
    const itemInInventory = this.getItemOnPlayer(itemToAdd);
    if (itemInInventory) {
      itemInInventory.incrementQuantity();
    } else {
      this.contents.push(itemToAdd);
    }
    return itemToAdd;
  }
  removeItemFromcontents(itemToRemove: Item): boolean {
    const toRemoveIdx = this.contents.findIndex(item => item.id === itemToRemove.id);
    const toRemove = this.contents[toRemoveIdx];
    if (toRemove) {
      if (toRemove.quantity <= 1) {
        this.contents.splice(toRemoveIdx, 1);
      } else {
        toRemove.decrementQuantity();
      }
      return true;
    }
    return false;
  }
  consumeItem(item: Item) {
    this.removeItemFromcontents(item);
  }
  getItemsOnPlayer(): Item[] {
    return this.contents;
  }
  getItemOnPlayer(itemToGet: Item): Item {
    return this.contents.find(item => item.id === itemToGet.id);
  }
  getItemsOnPlayerByCategory(category: string): Item[] {
    return this.contents.filter(item => item.category === category);
  }
}
export class StateManager {
  /**
   *  Handles the state of the game.
   * Items, events, state switches, current party
   *
   */
  private static instance: StateManager;
  private game: Phaser.Game;
  public flags: Map<string, FlagModule>;
  public itemController: ItemController;
  public dialogController: DialogController;
  public playerContents: PlayerContents;
  private constructor() {
    this.playerContents = new PlayerContents();
  }
  static getInstance() {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return this.instance;
  }
  getItem(id) {
    return this.itemController.getItem(id);
  }
  public initialize(game: Phaser.Game) {
    this.game = game;
    this.itemController = new ItemController(this.game);
    this.dialogController = new DialogController(this.game);
    this.flags = new Map<string, FlagModule>();
  }
  public addFlagModule(name: string) {
    this.flags.set(name, new FlagModule());
  }

  public isFlagged(flagModuleKey, keyOfFlag) {
    const flagModule = this.flags.get(flagModuleKey);
    if (flagModule) {
      return flagModule.isFlagged(keyOfFlag);
    } else {
      console.error('Flag Module does not exist');
    }
  }
}
