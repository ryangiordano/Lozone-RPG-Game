import { Combatant } from "../Combatant";
import { CombatGrid } from "./CombatGrid";
import { CombatSprite } from "./CombatSprite";
export class CombatContainer extends Phaser.GameObjects.Container {
  private combatSprites: CombatSprite[] = [];
  private combatGrid: CombatGrid = new CombatGrid({ x: 3, y: 3 }, 16);
  constructor(position: Coords, scene, combatants: Combatant[] = []) {
    super(scene, position.x * 16, position.y * 16);
    combatants.forEach(combatant => {
      this.combatSprites.push(new CombatSprite(scene, 0, 0, combatant).setAlpha(0));
    });
  }
  public populateContainer() {
    // TODO:For now let's populate four characters in four corners of the grid. Later let's store the position somewhere on the combatant themselves.
    const positions = [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 2 }, { x: 2, y: 2 }];
    this.combatSprites.forEach(combatSprite => {
      this.add(combatSprite);
      const currentPosition = positions.pop();
      this.combatGrid.placeAt(currentPosition, combatSprite);
      combatSprite.setOrigin(.5, .5);
      combatSprite.setAlpha(1);
    });
  }
  public populateContainerRandomly() {
    this.combatSprites.forEach(combatSprite => {
      this.add(combatSprite);
      const y = Math.floor(Math.random() * 3);
      this.combatGrid.placeAtRandomOpenPosition(combatSprite);
      y > 1 ? this.bringToTop(combatSprite) : this.sendToBack(combatSprite);
      combatSprite.setOrigin(.5, .5);
      combatSprite.setAlpha(1);
    });
  }
  addCombatant(combatSprite: CombatSprite) {
    this.add(combatSprite);
  }
}
