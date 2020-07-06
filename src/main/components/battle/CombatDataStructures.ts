import { Buff } from "./Buff";
import { BaseStat } from "./PartyMember";
import { Combatant } from "./Combatant";
import { Enemy } from "./Enemy";
import { SpellType, TargetType } from "../../data/repositories/SpellRepository";

/*
 * duration is the number in turns left for its lifetime.
 */
export interface IBuff {
  id: number;
  modifiers: Modifier[];
  duration: number;
  name: string;
}

export enum CombatantType {
  partyMember,
  enemy,
  boss,
}
export enum Orientation {
  left,
  right,
}
export enum Status {
  sleep,
  paralyzed,
  blinded,
  confused,
  fainted,
}
export enum ModifierStatType {
  strength,
  stamina,
  speed,
  intellect,
  wisdom,
  dexterity,
  hp,
  mp,
  physicalResistance,
  magicalResistance,
}
export interface Modifier {
  modifierStatType: BaseStat;
  modifierPotency: number;
  particle?: number;
  frame?: number;
}

export interface Spell {
  id: number;
  name: string;
  primaryAnimationEffect: Effect;
  animationEffect: Effect;
  description: string;
  basePotency: number;
  type: SpellType;
  cost: number;
  targetType: TargetType;
  status: any[];
  appliedBuffs?: Buff[];
  message?: string;
  isSkill?: boolean;
}

export interface Behavior {
  id: number;
  //For use with enemy AI
  // TODO: implement a db for this
}
export interface Effect {
  id: number;
  name: string;
  play: Function;
  // For use with items and spells.
  //TODO: implement a db for this
}

export interface CombatEntity {
  entity: Combatant;
  position: Coords;
}

export interface IEntityParty {
  entities: CombatEntity[];
}

export interface CombatResult {
  actionType: CombatActionTypes;
  executor: Combatant;
  target: Combatant;
  resultingValue: number;
  targetDown?: boolean;
  message?: string[];
  critical?: boolean;
}
export enum CombatActionTypes {
  attack,
  heal,
  defend,
  castSpell,
  useItem,
  failure,
  enchantment,
}

export interface CombatAction {
  name: string;
  description: string;
  action: CombatResult;
}

export interface LootCrate {
  itemIds: number[];
  coin: number;
  experiencePoints: number;
}
