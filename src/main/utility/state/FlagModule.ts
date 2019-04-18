export class FlagModule {
  private flagMap: Map<string, boolean>;
  constructor() {
    this.flagMap = new Map<string, boolean>();
  }
  public setFlag(key, flagged) {
    this.flagMap.set(key, flagged);
  }
  public setMultipleFlags(arr: any[]) {
    arr.forEach(el => {
      this.flagMap.set(el[0], el[1]);
    });
  }
  public isFlagged(key) {
    return this.flagMap.get(key);
  }
  public hasFlag(key) {
    return this.flagMap.has(key);
  }
}
