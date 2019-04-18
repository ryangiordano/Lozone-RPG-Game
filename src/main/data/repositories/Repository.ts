export abstract class Repository<T> {
  constructor(private dbContext) {

  }
  public getById(id): T {
    const entry = this.dbContext[id];
    if (entry) {
      return this.dbContext[id];
    } else {
      console.error(`Entity at id: ${entry} does not exist in the current database context`);
    }
  }
  public getAll(): T[] {
    const entries = Object.keys(this.dbContext).reduce((acc, key, idx) => {
      acc.push({ id: key, ...this.dbContext[key] });
      return acc;
    }, []);
    if (entries) {
      return entries;
    }
  }
}
