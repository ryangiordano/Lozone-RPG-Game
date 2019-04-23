import { Item } from "../entities/Item";
import { Enemy } from "./Enemy";
import { Combatant } from "./Combatant";

export interface Buff {
  id: number;
  modifiers: Modifier[];
  name: string;
}

export enum Status {
  sleep,
  paralyzed,
  blinded,
  confused,
  fainted
}
export enum ModifierStatType {
  strength, stamina, speed, intellect, wisdom, dexterity, hp, mp
}
export interface Modifier {
  id: number;
  name: string;
  modifierStatType: ModifierStatType;
  modifierPotency: number;
}
export interface Spell {
  id: number;
  name: string;
  effectId: number;
  potency: number;
}
export interface Behavior {
  id: number;
  //For use with enemy AI
  // TODO: implement a db for this
}
export interface Effect {
  id: number;
  // For use with items and spells.
  //TODO: implement a db for this
}

export interface EnemyParty {
  enemies: number[]
}

export interface CombatResult {
  //define later 
  action: CombatActions,
  executor: Combatant,
  target: Combatant,
  resultingValue: number,
  targetDown?: boolean
}
export enum CombatActions {
  attack,
  defend,
  castSpell,
  useItem
}