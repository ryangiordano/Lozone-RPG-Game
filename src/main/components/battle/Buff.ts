import { Modifier, IBuff, Effect } from "./CombatDataStructures";

export class Buff implements IBuff {
  constructor(
    public id: number,
    public modifiers: Modifier[],
    public duration: number,
    public name: string,
    public description: string,
    public icon: string = "status",
    public frame: number,
    public effect: Effect,
    public color: number
  ) {}
}
