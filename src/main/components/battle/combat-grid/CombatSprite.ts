import { Combatant } from "../Combatant";
export class CombatSprite extends Phaser.GameObjects.Sprite {
  private combatant: Combatant;
  constructor(scene, x, y, combatant) {
    super(scene, x, y, combatant.spriteKey);
    this.combatant = combatant;
  }
}
