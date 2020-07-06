import { MenuScene } from "./../../menuScene";
import { State } from "../../../../utility/state/State";
import { KeyboardControl } from "../../../../components/UI/Keyboard";
import { GameScenes } from "../../../../game";
import { PartyMenuContainer } from "../Shared/PartyMenuContainer";
import { PartyEquipmentMenuContainer } from "./PartyEquipmentMenuContainer";

export class PartyEquipScene extends Phaser.Scene {
  private callingSceneKey: GameScenes;
  private partyMenuContainer: PartyMenuContainer;
  constructor() {
    super({ key: "PartyEquipScene" });
  }

  public init(data) {
    const state = State.getInstance();
    const party = state.getCurrentParty().getMembers();
    const equipment = data.entity;
    this.partyMenuContainer = new PartyEquipmentMenuContainer(
      this,
      { x: 4 * 64, y: 0 },
      party,
      new KeyboardControl(this),
      equipment
    );

    this.partyMenuContainer.on("close-menu", () => {
      const menu = <MenuScene>this.scene.get("MenuScene");
      this.scene.setActive(true, "MenuScene");
      menu.openEquipmentMenu();

      this.scene.stop();
    });
  }
}
