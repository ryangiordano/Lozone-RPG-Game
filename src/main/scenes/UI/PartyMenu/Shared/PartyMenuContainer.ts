import { PartyMessagePanel } from "./PartyMessagePanel";
import { CombatEntity } from "../../../../components/battle/CombatDataStructures";
import {
  KeyboardControl,
  KeyboardControlKeys,
} from "../../../../components/UI/Keyboard";
import { PartyMemberPanel } from "./PartyMemberPanel";
import { PartyMember } from "../../../../components/battle/PartyMember";
import { Item } from "../../../../components/entities/Item";

/**
 * The container that houses all panels for the party menu scenes
 * sets up keybindings and renders the party member panels
 * as well as the dialog box for actions taken in the party member panel.
 */
export class PartyMenuContainer extends Phaser.GameObjects.Container {
  public partyMemberPanels: any[][] = [];
  protected activeIndex: number[] = [0, 0];
  protected partyMessagePanel: PartyMessagePanel;

  constructor(
    scene: Phaser.Scene,
    coordinates: Coords,
    partyMembers: CombatEntity[],
    protected keyboardControl: KeyboardControl,
    protected entity?: any
  ) {
    super(scene, coordinates.x, coordinates.y);
    this.partyMessagePanel = new PartyMessagePanel(
      scene,
      { x: 6, y: 3 },
      { x: 4, y: 6 }
    );
    this.scene.add.existing(this.partyMessagePanel);

    partyMembers.forEach((partyMember, i) => {
      const panelSize = 3;
      const row = Math.floor(i / 2);
      const col = Math.ceil(i % 2) ? panelSize : 0;
      const partyMemberPanel = new PartyMemberPanel(
        {
          x: 3,
          y: 3,
        },
        { x: col + 4, y: row * panelSize },
        "dialog-white",
        scene,
        <PartyMember>partyMember.entity
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

  protected getFocusedPartyMember() {
    const panel = this.getCurrentlyFocusedPartyMemberPanel();
    return panel.partyMember;
  }

  private setupKeyboard() {
    this.keyboardControl.on(
      KeyboardControlKeys.ESC,
      "party-menu-container",
      () => this.emit("close-menu")
    );
    this.keyboardControl.on(
      KeyboardControlKeys.RIGHT,
      "party-menu-container",
      () => this.focusNext()
    );
    this.keyboardControl.on(
      KeyboardControlKeys.DOWN,
      "party-menu-container",
      () => this.focusBelow()
    );
    this.keyboardControl.on(
      KeyboardControlKeys.UP,
      "party-menu-container",
      () => this.focusAbove()
    );
    this.keyboardControl.on(
      KeyboardControlKeys.LEFT,
      "party-menu-container",
      () => this.focusPrevious()
    );
    this.setSpaceListener();
  }

  protected setSpaceListener() {
    // Implement in inheriting classes
  }

  private teardownKeyboard() {
    this.keyboardControl.off(KeyboardControlKeys.ESC, "party-menu-container");
  }

  protected focusMessage(focusedMember) {
    return this.partyMessagePanel.populateStatsPanel(focusedMember.partyMember);
  }

  protected focusActive() {
    this.blurAll();
    const currentMember = this.getCurrentlyFocusedPartyMemberPanel();
    currentMember.focus();
    this.focusMessage(currentMember);
  }
  protected blurAll() {
    this.partyMemberPanels.forEach((row) =>
      row.forEach((panel) => panel.blur())
    );
  }

  protected getCurrentlyFocusedPartyMemberPanel() {
    const i = this.activeIndex;
    return this.partyMemberPanels[i[0]][i[1]];
  }

  protected getPartyMemberPanelById(id: number) {
    let result;
    this.partyMemberPanels.forEach((row) =>
      row.forEach((panel) => {
        if (panel.partyMember.id === id) {
          result = panel;
        }
      })
    );
    return result;
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

  protected playHealAnimation(panel, item: Item) {
    item.effect.animationEffect.play(95, 55, this.scene, panel);
  }
}
