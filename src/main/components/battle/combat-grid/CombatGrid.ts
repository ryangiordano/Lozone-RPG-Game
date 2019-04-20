import { CombatSprite } from "./CombatSprite";
import { CombatCel } from "./CombatCel";
export class CombatGrid {
  public grid = [];
  constructor(private size: Coords, private celSize: number) {
    this.createGrid();
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
  placeAt(position: Coords, combatSprite: CombatSprite) {
    const cel = this.grid[position.y][position.x];
    cel.set(combatSprite);
  }
  private flattenGrid() {
    return this.grid.reduce((acc, row) => {
      return [...acc, ...row];
    }, []);
  }
  placeAtRandomOpenPosition(combatSprite: CombatSprite) {
    const randomEmpty = this.findRandomEmptyCel();
    randomEmpty.set(combatSprite);
  }
  private findRandomEmptyCel() {
    const flattenedEmptyGrid: CombatCel[] = this.flattenGrid().filter(cel => cel.isEmpty);
    return flattenedEmptyGrid[Math.floor(Math.random() * flattenedEmptyGrid.length)];
  }
}
