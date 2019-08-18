import { DialogController } from "../../data/controllers/DialogController";
import { ItemController } from "../../data/controllers/ItemController";
import { Flag } from "./FlagModule";
import { PlayerContents } from "./PlayerContents";
import { HeroParty } from "../../components/battle/Party";
import { FlagController } from '../../data/controllers/FlagController';
import { NPCController } from '../../data/controllers/NPCController';

export class State {
  /**
   *  Handles the state of the game.
   * Items, events, state switches, current party
   */
  private static instance: State;
  private game: Phaser.Game;
  public flags: Map<string, Flag>;
  public flagController: FlagController;
  public itemController: ItemController;
  public dialogController: DialogController;
  public npcController: NPCController;
  public playerContents: PlayerContents;
  private party: HeroParty;
  private constructor() { }

  static getInstance() {
    if (!State.instance) {
      State.instance = new State();
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
  getItemOnPlayer(id: string | number) {
    return this.playerContents.getItemOnPlayer(id);
  }
  getItemsOnPlayer() {
    return this.playerContents.getItemsOnPlayer();
  }

  public getCurrentParty() {
    return this.party;
  }

  public initialize(game: Phaser.Game) {
    this.game = game;
    this.itemController = new ItemController(this.game);
    this.dialogController = new DialogController(this.game);
    this.flagController = new FlagController(this.game);
    this.npcController = new NPCController(this.game);
    this.playerContents = new PlayerContents();

    this.flags = this.flagController.getAllFlags();
    this.party = new HeroParty([1, 2, 3], this.game);
  }

  public isFlagged(id: number) {
    return this.flags.get(`${id}`) && this.flags.get(`${id}`).flagged;
  }
  public allAreFlagged(ids: number[]) {
    return ids.every(id => this.isFlagged(id));
  }
  public setFlag(id: number, flagged: boolean) {
    if (!this.flags.get(`${id}`)) {
      throw new Error(`Flag with ${id} does not exist`);
    }
    return this.flags.get(`${id}`).flagged = flagged;
  }
}
