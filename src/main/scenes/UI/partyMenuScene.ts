import { PanelContainer } from "../../components/UI/PanelContainer";
import { PartyMember } from "../../components/battle/PartyMember";
import { State } from "../../utility/state/State";
import { HeroParty, Party } from "../../components/battle/Party";
import { KeyboardControl } from "../../components/UI/Keyboard";

export class PartyMenuScene extends Phaser.Scene {
  private partyMenuContainer: PartyMenuContainer;
  private callingSceneKey: string;
  constructor() {
    super({ key: "PartyMenuScene" });
  }
  public init(data) {
    //   Here we will spin up a container.
    // Fill it with party member panels
    this.callingSceneKey = data.callingSceneKey;
    const state = State.getInstance();
    const party = state.getCurrentParty().getParty();
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

class PartyMenuContainer extends Phaser.GameObjects.Container {
  private partyMemberPanels: any[][] = [];
  private activeIndex: number[] = [0, 0];
  constructor(
    scene: Phaser.Scene,
    private coordinates: Coords,
    private partyMembers: PartyMember[],
    private keyboardControl: KeyboardControl
  ) {
    super(scene, coordinates.x, coordinates.y);
    partyMembers.forEach((partyMember, i) => {
      const panelSize = 3;
      const row = Math.floor(i / 2);
      const col = Math.ceil(i % 2) ? panelSize : 0;
      const partyMemberPanel = new PartyMemberPanel(
        {
          x: 3,
          y: 3
        },
        { x: col + 4, y: row * panelSize },
        "dialog-white",
        scene,
        partyMember
      );
      this.partyMemberPanels[row]
        ? this.partyMemberPanels[row].push(partyMemberPanel)
        : this.partyMemberPanels.push([partyMemberPanel]);
      scene.add.existing(partyMemberPanel);
    });
    this.keyboardControl.setupKeyboardControl();
    this.setupKeyboard();

    this.focusActive();
  }
  private setupKeyboard() {
    this.keyboardControl.on("esc", "party-menu-container", () =>
      this.emit("close-menu")
    );
    this.keyboardControl.on("right", "party-menu-container", () =>
      this.focusNext()
    );
    this.keyboardControl.on("down", "party-menu-container", () =>
      this.focusBelow()
    );
    this.keyboardControl.on("up", "party-menu-container", () =>
      this.focusAbove()
    );
    this.keyboardControl.on("left", "party-menu-container", () =>
      this.focusPrevious()
    );
    this.keyboardControl.on("space", "party-menu-container", () => {
      this.selectPartyMember();
    });
    // TODO: Set listeners for traversing and selecting character portraits.
  }
  private teardownKeyboard() {
    this.keyboardControl.off("esc", "party-menu-container");
  }

  private focusActive() {
    this.blurAll();
    this.getCurrentlyFocusedPartyMemberPanel().focusPanel();
  }
  private blurAll() {
    this.partyMemberPanels.forEach(row =>
      row.forEach(panel => panel.blurPanel())
    );
  }

  private getCurrentlyFocusedPartyMemberPanel() {
    const i = this.activeIndex;
    return this.partyMemberPanels[i[0]][i[1]];
  }

  public focusNext() {
    const row = this.activeIndex[0];
    const i = this.activeIndex[1] + 1;
    const col = this.partyMemberPanels[row][i] ? i : this.activeIndex[1];
    this.activeIndex = [row, col];
    this.focusActive();
  }
  public focusPrevious() {
    const row = this.activeIndex[0];
    const i = this.activeIndex[1] - 1;
    const col = Math.max(0, i);
    this.activeIndex = [row, col];
    this.focusActive();
  }
  public focusBelow() {
    const i = this.activeIndex[0] + 1;
    const col = this.activeIndex[1];
    const row =
      this.partyMemberPanels[i] && this.partyMemberPanels[i][col]
        ? i
        : this.activeIndex[0];
    this.activeIndex = [row, col];
    this.focusActive();
  }
  public focusAbove() {
    const i = this.activeIndex[0] - 1;
    const col = this.activeIndex[1];
    const row = Math.max(0, i);
    this.activeIndex = [row, col];
    this.focusActive();
  }

  public selectPartyMember() {
    //TODO: Work out Selectioon Logic
    console.log(this.getCurrentlyFocusedPartyMemberPanel().partyMember);
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
    scene,
    public partyMember
  ) {
    super(dimensions, position, spriteKey, scene);
    this.showPanel();
    this.blurPanel();
  }
}
