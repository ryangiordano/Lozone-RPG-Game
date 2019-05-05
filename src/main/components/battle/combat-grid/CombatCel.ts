import { Combatant } from "../Combatant";
export class CombatCel {
  constructor(private pixelCoordinates: Coords, private combatantInCel?: Combatant) {
  }
  getX() {
    return this.pixelCoordinates.x;
  }
  getY() {
    return this.pixelCoordinates.y;
  }
  get(): Combatant {
    return this.combatantInCel;
  }
  set(combatant: Combatant): boolean {
    if (this.isEmpty()) {
      this.combatantInCel = combatant;
      this.combatantInCel.getSprite().setX(this.pixelCoordinates.x);
      this.combatantInCel.getSprite().setY(this.pixelCoordinates.y);
      return true;
    }
    return false;
  }
  isEmpty() {
    return !this.combatantInCel;
  }
}
