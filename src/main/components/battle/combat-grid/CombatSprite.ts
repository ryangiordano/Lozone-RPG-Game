import { Combatant } from "../Combatant";
import { getUID } from "../../../utility/Utility";
export class CombatSprite extends Phaser.GameObjects.Sprite {
  private combatant: Combatant;
  public uid: string = getUID();
  constructor(scene, x, y, combatant) {
    super(scene, x, y, combatant.spriteKey);
    this.combatant = combatant;
    
  }
  getCombatant() {
    return this.combatant;
  }
}
