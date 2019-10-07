import { CombatCel } from "./CombatCel";
import { Combatant } from "../Combatant";
import { Grid } from "../../../utility/Grid";

/**
 * size:  The size of the grid as a set of coordinates
 * celSize: the cel size in pixels
 */
export class CombatGrid extends Grid {
  public grid: CombatCel[][] = [];
  constructor(protected size: Coords, private celSize: number) {
    super(size)
    this.createGrid();
  }
  
  protected createGrid() {
    for (let row = 0; row < this.size.y; row++) {
      this.grid.push([]);
      for (let col = 0; col < this.size.x; col++) {
        this.grid[row].push(
          new CombatCel({ x: col * this.celSize, y: row * this.celSize })
        );
      }
    }
  }

  public placeAt(position: Coords, combatant: Combatant) {
    const cel = this.grid[position.y][position.x];
    cel.set(combatant);
  }

  public placeAtRandomOpenPosition(combatant: Combatant) {
    const randomEmpty = this.findRandomEmptyCel();
    randomEmpty.set(combatant);
  }

  public getCelWithCombatant(combatant: Combatant){
    return this.flattenGrid().find(cel=>cel.get() === combatant);
  }


}
