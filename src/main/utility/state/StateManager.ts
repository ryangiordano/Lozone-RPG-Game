import { DialogController } from '../../data/controllers/DialogController';
import { ItemController } from '../../data/controllers/ItemController';
import { FlagModule } from './FlagModule';
import { PlayerContents } from './PlayerContents';
import { Party } from '../../components/battle/Party';

export class StateManager {
  /**
   *  Handles the state of the game.
   * Items, events, state switches, current party
   */
  private static instance: StateManager;
  private game: Phaser.Game;
  public flags: Map<string, FlagModule>;
  public itemController: ItemController;
  public dialogController: DialogController;
  public playerContents: PlayerContents;
  private party: Party;
  private constructor() {

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
  addItemToContents(id: string | number) {

    const itemToAdd = this.itemController.getItem(id);
    this.playerContents.addItemToContents(itemToAdd);
    return itemToAdd;
  }
  removeItemFromContents(id: string | number) {
    const itemToRemove = this.itemController.getItem(id);
    this.playerContents.removeItemFromContents(itemToRemove);
    return itemToRemove;
  }
  consumeItem(id: string | number) {
    const itemToConsume = this.itemController.getItem(id);
    this.playerContents.consumeItem(itemToConsume);
    return itemToConsume;
  }
  getItemsOnPlayer() {
    return this.playerContents.getItemsOnPlayer();
  }
  public getCurrentParty() {
    // This will be retrieved from a save data.
    return this.party;
  }
  public initialize(game: Phaser.Game) {
    this.game = game;
    this.itemController = new ItemController(this.game);
    this.dialogController = new DialogController(this.game);
    this.playerContents = new PlayerContents();
    // For now, just use Lo to get the ball rolling

    this.party = new Party([1], this.game);
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
