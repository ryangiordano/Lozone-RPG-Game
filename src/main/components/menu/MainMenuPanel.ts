import { UIPanel } from "../UI/PanelContainer";
import { PartyMenuTypes } from "../../scenes/UI/UIDataTypes";

export class MainPanel extends UIPanel {
  constructor(
    dimensions: Coords,
    pos: Coords,
    spriteKey: string,
    scene: Phaser.Scene,
    id?: string
  ) {
    super(dimensions, pos, spriteKey, scene, true, id);
  }

  setUp() {
    this.addOption("Items", () => {
      this.emit("items-selected", PartyMenuTypes.itemUse);
    })

      .addOption("Key Items", () => {
        this.emit("key-items-selected");
      })
      .addOption("Magic", () => {
        this.emit("magic-selected", PartyMenuTypes.spellCast);
      })
      .addOption("Status", () => {
        this.emit("party-selected", PartyMenuTypes.statusCheck);
      })
      .addOption("Debug", () => {
        this.emit("debug-selected");
      })
      .addOption("Cancel", () => this.emit("cancel-selected"));
  }
}
