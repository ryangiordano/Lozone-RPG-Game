import { UIPanel } from "./../../../../components/UI/UIPanel";
import { Spell } from "../../../../components/battle/CombatDataStructures";

import { SpellType } from "../../../../data/repositories/SpellRepository";
import { TextFactory } from "../../../../utility/TextFactory";
import { BLACK } from "../../../../utility/Constants";
export class SpellListPanel extends UIPanel {
  private currentText: Phaser.GameObjects.Text;

  constructor(
    public scene: Phaser.Scene,
    dimensions: Coords,
    position: Coords
  ) {
    super(dimensions, position, "dialog-white", scene, false);
  }

  public populateSpells(spells: Spell[]) {
    this.addOptionsViaData(spells);
  }

  private addOptionsViaData(spells: Spell[]) {
    spells.forEach((spell) => {
      const displaySpell = spell.type === SpellType.restoration;
      if (displaySpell) {
        this.addOption(
          `${spell.name}: ${spell.manaCost}mp`,
          () => {
            this.emit("spell-selected", spell);
          },
          () => {
            this.emit("spell-focused", spell);
          }
        );
      }
    });
    this.addOption(
      "Cancel",
      () => {
        this.emit("panel-close");
      },
      () => {
        this.emit("spell-focused", null);
      }
    );
  }

  /** Update the detail of the spell being focused. */
  public updateDisplay(spell) {
    // const container = this.childPanels.get("spell-detail");
    // container.clearPanelContainerByTypes(["Text", "Sprite"]);
    if (!spell) return;
    const textFactory = new TextFactory(this.scene);
    const { description, frame, spriteKey } = spell;
    const textDescription = textFactory.createText(
      description,
      { x: 30, y: 90 },
      "18px",
      {
        wordWrap: {
          width: (this.panel.width / 4.5) * 4,
          useAdvancedWrap: true,
        },
      }
    );
  }

  /**
   * Function that results after the message scene is done doing its thing.
   * @param message
   */
  public displayMessage(message: string, fontSize: number = 32) {
    this.currentText && this.clearPanelContainerByType("Text");
    this.currentText = this.scene.add.text(
      this.panel.x + 20,
      this.panel.y + 20,
      message,
      {
        fontFamily: "pixel",
        fontSize: `${fontSize}px`,
        fill: BLACK.hex,
        wordWrap: {
          width: (this.panel.width / 4.5) * 4,
          useAdvancedWrap: true,
        },
      }
    );
    this.add(this.currentText);
    this.currentText.setScrollFactor(0);
  }
}
