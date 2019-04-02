export class StateManager {
  private static instance: StateManager;
  private constructor(){

  }
  public static getInstance(){
    return this.instance || (this.instance = new this());
  }
}
