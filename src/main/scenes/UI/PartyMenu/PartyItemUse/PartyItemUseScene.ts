import { GameScenes } from "./../../../../game";
import { PartyMenuConfig } from "../../UIDataTypes";
import { State } from "../../../../utility/state/State";
import { KeyboardControl } from "../../../../components/UI/Keyboard";
import { PartyItemUseMenuContainer } from "./PartyItemUseMenuContainer";
export class PartyItemUseScene extends Phaser.Scene {
  private callingSceneKey: GameScenes;
  private partyMenuContainer: PartyItemUseMenuContainer;
  constructor() {
    super({ key: "PartyItemUseScene" });
  }

  public init(data) {
    const { entity } = data;
    //   Here we will spin up a container.
    // Fill it with party member panels
    this.callingSceneKey = data.callingSceneKey;
    const state = State.getInstance();
    const party = state.getCurrentParty().getParty();
    this.partyMenuContainer = new PartyItemUseMenuContainer(
      this,
      { x: 4 * 64, y: 0 },
      party,
      new KeyboardControl(this),
      entity
    );
    this.partyMenuContainer.on("close-menu", () => {
      this.scene.setActive(true, this.callingSceneKey);
      this.scene.stop();
    });
  }
}
