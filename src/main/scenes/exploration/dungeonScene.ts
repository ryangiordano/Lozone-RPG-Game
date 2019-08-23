import { Explore } from "./exploreScene";
import { createRandom, getRandomFloor } from "../../utility/Utility";
import { KeyboardControl } from "../../components/UI/Keyboard";

export class DungeonScene extends Explore {
  private enemyPartyIds: number[] = [];
  private hasRandomEncounter = () => {
    const randomNumber = createRandom(10);
    return randomNumber() === 10
  };
  constructor() {
    super('Dungeon');

  }

  public afterInit(data) {
    this.enemyPartyIds = data.enemyPartyIds;
    this.keyboardControl = new KeyboardControl(this);
    this.keyboardControl.setupKeyboardControl();
  }
  
  public afterCreated() {
    this.player.on('finished-movement', () => {
      if (this.hasRandomEncounter() && this.enemyPartyIds) {
        this.startRandomEncounter(this.chooseEnemyAtRandom());
      }
    });
  }

  private chooseEnemyAtRandom(): number {
    return this.enemyPartyIds[getRandomFloor(this.enemyPartyIds.length)]
  }

  private startRandomEncounter(enemyPartyId: number) {
    this.input.keyboard.resetKeys();
    this.scene.manager.sleep(this.scene.key);
    this.scene.run('Battle', { key: this.scene.key, enemyPartyId })
  }
}