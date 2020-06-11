import { GameScenes } from "./../../../../game";
import { PartyMenuScene } from "../PartyMenuScene";
import { PartyMenuConfig } from "../../UIDataTypes";
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
    const config: PartyMenuConfig = data.config;
    const { type, entity } = config;

    //   Here we will spin up a container.
    // Fill it with party member panels
    this.callingSceneKey = data.callingSceneKey;
    const state = State.getInstance();
    const party = state.getCurrentParty().getParty();
    this.partyMenuContainer = new PartyMenuContainer(
      this,
      { x: 4 * 64, y: 0 },
      party,
      new KeyboardControl(this),
      type,
      entity
    );
    this.partyMenuContainer.on("close-menu", () => {
      this.scene.setActive(true, this.callingSceneKey);
      this.scene.stop();
    });
  }
}
