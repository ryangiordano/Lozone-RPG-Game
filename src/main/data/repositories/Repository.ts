export abstract class Repository<T> {
  constructor(protected dbContext) {

  }

  public getById(id): T {
    const entry = this.dbContext[id];
    if (entry) {
      return { id, ...this.dbContext[id] };
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

  public getAllAsMap(): Map<string, T> {
    const database = this.getAll();
    const dataMap: Map<string, T> = new Map();
    database.forEach(data => dataMap.set(data['id'], data))
    return dataMap;
  }
}
