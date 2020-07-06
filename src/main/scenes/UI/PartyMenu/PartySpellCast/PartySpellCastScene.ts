import { State } from "../../../../utility/state/State";
import { KeyboardControl } from "../../../../components/UI/Keyboard";
import { GameScenes } from "../../../../game";
import { PartySpellCastMenuContainer } from "./PartySpellCastMenuContainer";
import { PartySpellSelectMenuContainer } from "./PartySpellSelectMenuContainer";
import { PartyMenuContainer } from "../Shared/PartyMenuContainer";

export class PartySpellCastScene extends Phaser.Scene {
  private callingSceneKey: GameScenes;
  private partyMenuContainer: PartyMenuContainer;
  constructor() {
    super({ key: "PartySpellCastScene" });
  }

  public init(data) {
    const state = State.getInstance();
    const party = state.getCurrentParty().getMembers();
    const spell = data.spell;
    const caster = data.caster;
    this.partyMenuContainer = data.spell
      ? new PartySpellCastMenuContainer(
          this,
          { x: 4 * 64, y: 0 },
          party,
          new KeyboardControl(this),
          spell,
          caster
        )
      : new PartySpellSelectMenuContainer(
          this,
          { x: 4 * 64, y: 0 },
          party,
          new KeyboardControl(this)
        );

    this.partyMenuContainer.on("close-menu", () => {
      this.scene.setActive(true, "MenuScene");
      this.scene.stop();
    });
  }
}
