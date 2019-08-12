import { CombatGrid } from "./CombatGrid";
import { getRandomFloor } from "../../../utility/Utility";
import { Combatant } from "../Combatant";

export class CombatContainer extends Phaser.GameObjects.Container {
  private combatGrid: CombatGrid = new CombatGrid({ x: 3, y: 3 }, 64);
  private battleTarget: Phaser.GameObjects.Image;
  constructor(position: Coords, scene, private combatants: Combatant[] = []) {
    super(scene, position.x * 64, position.y * 64);
    this.battleTarget = new Phaser.GameObjects.Image(this.scene, 0, 0, 'battle-target');
  }
  public populateContainer() {
    // TODO:For now let's populate four characters in four corners of the grid. Later let's store the position somewhere on the combatant themselves.
    const positions = [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 2 }, { x: 2, y: 2 }];
    this.combatants.forEach(combatant => {
      const sprite = combatant.getSprite();
      this.add(sprite);
      const currentPosition = positions.pop();
      this.combatGrid.placeAt(currentPosition, combatant);
      sprite.setOrigin(.5, .5);
      sprite.setAlpha(1);
    });
  }
  public populateContainerRandomly() {
    this.combatants.forEach(combatant => {
      const sprite = combatant.getSprite();
      this.add(sprite);
      const y = getRandomFloor(this.combatGrid.getHeight());
      this.combatGrid.placeAtRandomOpenPosition(combatant);
      y > 1 ? this.bringToTop(sprite) : this.sendToBack(sprite);
      sprite.setOrigin(.5, .5);
      sprite.setAlpha(1);
    });
    this.combatGrid.grid.forEach((row) => {
      row.forEach((cel) => {
        const combatant = cel.get();
        if (combatant) {
          this.bringToTop(combatant.getSprite());
        }
      })
    })
  }

  addCombatant(combatant: Combatant) {
    this.add(combatant.getSprite());
  }

  public getCombatants() {
    return this.combatants;
  }
}
