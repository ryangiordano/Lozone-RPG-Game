import { Modifier, IBuff } from "./CombatDataStructures";

export class Buff implements IBuff{
  constructor(
    public id: number,
    public  modifiers: Modifier[],
    public duration: number,
    public name: string
  ) {
    
  }
}
