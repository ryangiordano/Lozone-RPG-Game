import { ItemRepository } from '../../data/repositories/ItemRepository';
import { DialogRepository } from '../../data/repositories/DialogRepository';
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
export class StateManager {
  /**
   *  Handles the state of the game.
   * Items, events, state switches, current party
   *
   */
  private static instance: StateManager;
  private game: Phaser.Game;
  public flags: Map<string, FlagModule>;
  public itemRepository: ItemRepository;
  public dialogRepository: DialogRepository;

  private constructor() {}
  getItem(id) {
    return this.itemRepository.getItem(id);
  }
  public initialize(game: Phaser.Game) {
    this.game = game;
    this.itemRepository = new ItemRepository(this.game.cache.json.get('items'));
    this.dialogRepository = new DialogRepository(this.game.cache.json.get('dialog'));
    this.flags = new Map<string, FlagModule>();
  }
  public addFlagModule(name: string) {
    this.flags.set(name, new FlagModule());
  }
  static getInstance() {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return this.instance;
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
