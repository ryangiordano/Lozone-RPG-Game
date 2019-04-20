import { CombatSprite } from "./CombatSprite";
export class CombatCel {
  constructor(private pixelCoordinates: Coords, private combatantInCel?: CombatSprite) {
  }
  getX() {
    return this.pixelCoordinates.x;
  }
  getY() {
    return this.pixelCoordinates.y;
  }
  get(): CombatSprite {
    return this.combatantInCel;
  }
  set(combatant: CombatSprite): boolean {
    if (this.isEmpty()) {
      console.log("Setting via pixelcoordinates");
      this.combatantInCel = combatant;
      this.combatantInCel.setX(this.pixelCoordinates.x);
      this.combatantInCel.setY(this.pixelCoordinates.y);
      return true;
    }
    return false;
  }
  isEmpty() {
    return !this.combatantInCel;
  }
}
