import { GameScenes } from "./../../../../game";
import { State } from "../../../../utility/state/State";
import { PartyMenuContainer } from "../Shared/PartyMenuContainer";
import { KeyboardControl } from "../../../../components/UI/Keyboard";
export class PartyStatusScene extends Phaser.Scene {
  private callingSceneKey: GameScenes;
  private partyMenuContainer: PartyMenuContainer;
  constructor() {
    super({ key: "PartyStatusScene" });
  }

  public init(data) {
    this.callingSceneKey = data.callingSceneKey;
    const state = State.getInstance();
    const party = state.getCurrentParty().getMembers();
    this.partyMenuContainer = new PartyMenuContainer(
      this,
      { x: 4 * 64, y: 0 },
      party,
      new KeyboardControl(this)
    );
    this.partyMenuContainer.on("close-menu", () => {
      this.scene.setActive(true, this.callingSceneKey);
      this.scene.stop();
    });
  }
}
