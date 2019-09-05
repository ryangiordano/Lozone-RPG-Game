import { Explore } from "./exploreScene";
import { createRandom, getRandomFloor } from "../../utility/Utility";
import { KeyboardControl } from "../../components/UI/Keyboard";

export class DungeonScene extends Explore {
  private enemyPartyIds: number[] = [];
  private hasRandomEncounter = () => {
    const randomNumber = createRandom(20);
    const r = randomNumber()
    console.log(r);
    console.log(this.enemyPartyIds)
    return r === 10
  };
  constructor() {
    super('Dungeon');

  }

  public afterInit(data) {
    console.log(data)
    this.enemyPartyIds = data.enemyPartyIds;
    this.keyboardControl = new KeyboardControl(this);
    this.keyboardControl.setupKeyboardControl();
  }
  
  public afterCreated() {
    this.player.on('finished-movement', () => {

      if (this.hasRandomEncounter() && this.enemyPartyIds) {
        this.startEncounter(this.chooseEnemyAtRandom());
      }
    });
  }

  private chooseEnemyAtRandom(): number {
    return this.enemyPartyIds[getRandomFloor(this.enemyPartyIds.length)]
  }


}