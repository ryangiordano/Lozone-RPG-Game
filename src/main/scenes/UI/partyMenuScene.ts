import { PanelContainer } from "../../components/UI/PanelContainer";
import { PartyMember } from "../../components/battle/PartyMember";
import { State } from "../../utility/state/State";
import { HeroParty, Party } from "../../components/battle/Party";
import { KeyboardControl } from "../../components/UI/Keyboard";

export class PartyMenuScene extends Phaser.Scene {
  /**
   *
   */
  private partyMenuContainer: PartyMenuContainer;
  constructor() {
    super({ key: "PartyMenuScene" });
  }
  public init(data) {
    //   Here we will spin up a container.
    // Fill it with party member panels
    const state = State.getInstance();
    const party = state.getCurrentParty().getParty();
    this.partyMenuContainer = new PartyMenuContainer(
      this,
      { x: 4 * 64, y: 0 },
      party,
      new KeyboardControl(this)
    );
  }
}

class PartyMenuContainer extends Phaser.GameObjects.Container {
  /**
   *
   */
  constructor(
    scene: Phaser.Scene,
    private coordinates: Coords,
    private partyMembers: PartyMember[],
    private keyboardControl: KeyboardControl
  ) {
    super(scene, coordinates.x, coordinates.y);
    let row = 0;
    partyMembers.forEach((partyMember, i) => {
      const panelSize = 64 * 3;
      const row = Math.floor(i / 2);

      const col = Math.ceil(i % 2) ? panelSize : 0;
      const characterPanel = scene.add.nineslice(
        4 * 64 + col,
        row * panelSize,
        panelSize,
        panelSize,
        "dialog-white",
        20
      );
    });
    this.keyboardControl.setupKeyboardControl();
    this.setupKeyboard();
  }
  private setupKeyboard(){
      // TODO: Set listeners for traversing and selecting character portraits.
  }
  private teardownKeyboard(){

  }
}

class PartyMemberPanel extends PanelContainer {
  /**
   *
   */
  constructor(
    dimensions: Coords,
    position: Coords,
    spriteKey = "dialog-white",
    scene
  ) {
    super(dimensions, position, spriteKey, scene);
  }
}
