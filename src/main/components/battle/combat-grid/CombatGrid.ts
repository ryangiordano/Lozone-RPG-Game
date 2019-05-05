import { CombatCel } from "./CombatCel";
import { getRandomFloor } from "../../../utility/Utility";
import { Combatant } from "../Combatant";
export class CombatGrid {
  public grid: CombatCel[][] = [];
  constructor(private size: Coords, private celSize: number) {
    this.createGrid();
  }
  public getWidth() {
    return this.grid.length;
  }
  public getHeight() {
    return this.grid[0].length;
  }
  private createGrid() {
    for (let row = 0; row < this.size.y; row++) {
      this.grid.push([]);
      for (let col = 0; col < this.size.x; col++) {
        this.grid[row].push(new CombatCel({ x: col * this.celSize, y: row * this.celSize }));
      }
    }
  }
  public swap(from: Coords, to: Coords) {
    const temp = this.grid[from.y][from.x].get();
    this.grid[from.y][from.x].set(this.grid[to.y][to.x].get());
    this.grid[to.y][to.x].set(temp);
  }
  placeAt(position: Coords, combatant: Combatant) {
    const cel = this.grid[position.y][position.x];
    cel.set(combatant);
  }
  private flattenGrid() {
    return this.grid.reduce((acc, row) => {
      return [...acc, ...row];
    }, []);
  }
  placeAtRandomOpenPosition(combatant: Combatant) {
    const randomEmpty = this.findRandomEmptyCel();
    randomEmpty.set(combatant);
  }
  private findRandomEmptyCel() {
    const flattenedEmptyGrid: CombatCel[] = this.flattenGrid().filter(cel => !cel.get());

    return flattenedEmptyGrid[getRandomFloor(flattenedEmptyGrid.length)];
  }
}
