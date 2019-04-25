import { Combatant } from "../Combatant";
import { CombatGrid } from "./CombatGrid";
import { CombatSprite } from "./CombatSprite";
import { getRandomFloor } from "../../../utility/Utility";
export class CombatContainer extends Phaser.GameObjects.Container {
  private combatGrid: CombatGrid = new CombatGrid({ x: 3, y: 3 }, 16);
  private battleTarget: Phaser.GameObjects.Image;
  constructor(position: Coords, scene, private combatSprites: CombatSprite[] = []) {
    super(scene, position.x * 16, position.y * 16);
    this.battleTarget = new Phaser.GameObjects.Image(this.scene, 0, 0, 'battle-target')
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
      const y = getRandomFloor(3);
      this.combatGrid.placeAtRandomOpenPosition(combatSprite);
      y > 1 ? this.bringToTop(combatSprite) : this.sendToBack(combatSprite);
      combatSprite.setOrigin(.5, .5);
      combatSprite.setAlpha(1);
    });
  }
  addCombatant(combatSprite: CombatSprite) {
    this.add(combatSprite);
  }
  public getCombatants() {
    return this.combatSprites;
  }

}
