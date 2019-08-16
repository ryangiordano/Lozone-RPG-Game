export class FlagModule {
  // We get all the flags in the DB and store it here.
  // We then use this to store game state.  When we save the game, all of the
  // data cached here will be transferred to a save file.
  private flagMap: Map<string, boolean>;
  private flags: Flag[]
  constructor() {
    // this.flagMap = new Map<string, boolean>();
  }

  public setFlags(flags: Flag[]) {
    this.flags = flags;
  }

  public getFlag(flagId: number){
    const flag = this.flags[flagId];
    if (!flag) {
      throw new Error(`Flag not found at id ${flagId}`);
    }
    return this.flags[flagId];
  }

  setFlag(flagId: number, flagged: boolean) {
    const flag = this.getFlag(flagId);

    flag.flagged = flagged;
  }
  public setMultipleFlags(flagIds: number[], isFlagged: boolean) {
    flagIds.forEach(id =>this.setFlag(id, isFlagged));
  }
  public isFlagged(flagId: number) {
    const flag = this.getFlag(flagId);
    return flag.flagged
  }
}

export interface Flag {
  name: string,
  description: string,
  type: FlagTypes,
  flagged: boolean
}


export enum FlagTypes {
  chest,
  doorlock,
  dialog,
  globalEvent
}