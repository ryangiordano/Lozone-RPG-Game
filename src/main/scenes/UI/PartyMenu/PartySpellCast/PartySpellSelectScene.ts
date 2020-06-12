import { MessagePanel } from "./../Shared/MessagePanel";
import { Spell } from "./../../../../components/battle/CombatDataStructures";
import { GameScenes } from "./../../../../game";
import { SpellListPanel } from "./SpellListPanel";
import { UserInterface } from "../../../../components/UI/UserInterface";
import { KeyboardControl } from "../../../../components/UI/Keyboard";
import { startScene } from "../../../utility";
import { PartyMember } from "../../../../components/battle/PartyMember";
export class PartySpellSelectScene extends Phaser.Scene {
  private spellListPanel: SpellListPanel;
  private spellDescriptionPanel: MessagePanel;
  private callingSceneKey: GameScenes;
  private caster: PartyMember;
  private ui: UserInterface;
  constructor() {
    super({ key: "PartySpellSelectScene" });
  }

  init(data) {
    this.callingSceneKey = data.callingSceneKey;
    this.caster = data.caster;
    this.ui = new UserInterface(
      this,
      "dialog-white",
      new KeyboardControl(this)
    );
    this.buildSpellListPanel(data.spells);
    this.ui.addPanel(this.spellListPanel);
    this.ui.showPanel(this.spellListPanel);
    this.ui.focusPanel(this.spellListPanel);

    this.ui.initialize();
  }

  /** The panel showing spells to choose from */
  buildSpellListPanel(spells: Spell[]) {
    this.buildSpellDetailPanel();
    this.spellListPanel = new SpellListPanel(
      this,
      { x: 6, y: 3 },
      { x: 4, y: 3 }
    );

    this.spellListPanel.populateSpells(spells);

    this.spellListPanel.on("spell-focused", (spell) => {
      if (spell) {
        this.spellDescriptionPanel.displayMessage(spell.description);
      } else {
        this.spellDescriptionPanel.displayMessage(
          "Select a different party member."
        );
      }
    });

    this.spellListPanel.on("escape-pressed", () => {
      this.backToPrevious();
    });

    this.spellListPanel.on("panel-close", () => {
      this.backToPrevious();
    });

    this.spellListPanel.on("spell-selected", (spell) => {
      this.backToPreviousWithSpell(spell);
    });

    this.spellListPanel.addChildPanel(
      "spell-description-panel",
      this.spellDescriptionPanel
    );
  }

  /** Panel showing details of the spells focused */
  buildSpellDetailPanel() {
    this.spellDescriptionPanel = new MessagePanel(
      this,
      { x: 6, y: 3 },
      { x: 4, y: 6 }
    );
  }

  /** Back to the previous scene */
  backToPrevious() {
    this.scene.stop();
    startScene(this.callingSceneKey, this);
  }

  /** Back to the previous scene with spell and caster data */
  backToPreviousWithSpell(spell) {
    this.scene.stop();
    startScene(this.callingSceneKey, this, { spell, caster: this.caster });
  }
}
