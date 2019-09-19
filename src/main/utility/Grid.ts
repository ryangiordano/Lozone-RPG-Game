import { getRandomFloor } from './Utility';

export interface Cel {
  setX,
  setY,
  getX,
  getY,
  isEmpty
  get,
  set
}


export class Grid {
  /**
   * Base class for the grid object
   */
  public grid: Cel[][] = [];
  constructor(protected size: Coords) {

  }
  public getWidth() {
    return this.grid.length;
  }
  public getHeight() {
    return this.grid[0].length;
  }
  protected createGrid(cel: Cel) {
    for (let row = 0; row < this.size.y; row++) {
      this.grid.push([]);
      for (let col = 0; col < this.size.x; col++) {
        cel.setX(col)
        cel.setY(row)
        this.grid[row].push(cel);
      }
    }
  }

  public placeAt(position: Coords, entity: any) {
    const cel = this.grid[position.y][position.x];
    cel.set(entity);
  }

  protected flattenGrid() {
    return this.grid.reduce((acc, row) => {
      return [...acc, ...row];
    }, []);
  }

  protected findRandomEmptyCel() {
    const flattenedEmptyGrid = this.flattenGrid().filter(
      cel => !cel.get()
    );
    return flattenedEmptyGrid[getRandomFloor(flattenedEmptyGrid.length)];
  }

  public emptyAt(position: Coords): boolean {
    return !!this.flattenGrid().find(
      cel => cel.getX() === position.x
        && cel.getY() === position.y
        && cel.isEmpty())
  }

  public swap(from: Coords, to: Coords) {
    const temp = this.grid[from.y][from.x].get();
    this.grid[from.y][from.x].set(this.grid[to.y][to.x].get());
    this.grid[to.y][to.x].set(temp);
  }

  public getRowOfTargets(row: number): Cel[] {
    return this.grid[row].filter(cel => !cel.isEmpty);
  }
  public getColumnOfTargets(column: number): Cel[] {
    return this.grid.reduce((acc, row) => {
      if (!row[column].isEmpty) {
        acc.push()
      }
      return acc;
    }, []);

  }
  public getAllTargets(): Cel[] {
    return this.flattenGrid().filter(cel => !cel.isEmpty());
  }
}
/**
 * Represents a cel in the Grid data structure
 */
export class GridCel implements Cel {

  private celContents: number = null;
  constructor(private coords: Coords, entity: number) {

  }

  set(entity?: number) {
    if (this.isEmpty && entity >= 0) {
      this.celContents = entity;
    } else {
      this.celContents = null;
    }
  }
  get() {
    return this.celContents;
  }

  getX() {
    return this.coords.x
  }
  getY() {
    return this.coords.y
  }
  setX(x) {
    this.coords.x = x;
  }
  setY(y) {
    this.coords.y = y;
  }
  isEmpty() {
    this.celContents === null;
  }
}
