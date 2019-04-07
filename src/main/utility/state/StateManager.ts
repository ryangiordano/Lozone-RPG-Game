import { ItemModule } from './ItemModule';

export class StateManager {
  /**
   *  Handles the state of the game.
   * Items, events, state switches, current party
   *
   */
  private static instance: StateManager;
  private game: Phaser.Game;
  public itemModule: ItemModule;

  private constructor() {}
  getItem(id) {
    return this.itemModule.getItem(id);
  }
  initialize(game: Phaser.Game) {
    this.game = game;
    this.itemModule = new ItemModule(this.game.cache.json.get('items'));
  }
  static getInstance() {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return this.instance;
  }
}
