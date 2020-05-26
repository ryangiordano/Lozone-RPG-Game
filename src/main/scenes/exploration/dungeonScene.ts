import { Explore } from "./exploreScene";
import { createRandom, getRandomFloor } from "../../utility/Utility";
import { KeyboardControl } from "../../components/UI/Keyboard";
import { AudioScene } from "../audioScene";

export class DungeonScene extends Explore {
  private enemyPartyIds: number[] = [];
  private music: string = "dungeon";
  private hasRandomEncounter = () => {
    const randomNumber = createRandom(30);
    return randomNumber() === 10;
  };
  constructor() {
    super("Dungeon");
  }

  public afterInit(data) {
    this.enemyPartyIds = data.enemyPartyIds;
    this.keyboardControl = new KeyboardControl(this);
    this.keyboardControl.setupKeyboardControl();
    const audio = <AudioScene>this.scene.get("Audio");
    audio.play(this.music);
  }

  public afterCreated() {
    this.player.on("finished-movement", () => {
      if (this.hasRandomEncounter() && this.enemyPartyIds) {
        this.startEncounter(this.chooseEnemyAtRandom());
      }
    });
    this.events.on("battle-finish", () => {
      const audio = <AudioScene>this.scene.get("Audio");
      audio.resume(this.music);
    });
  }

  private chooseEnemyAtRandom(): number {
    return this.enemyPartyIds[getRandomFloor(this.enemyPartyIds.length)];
  }
}
