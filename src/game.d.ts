import { Item } from "./main/components/entities/Item";


declare type Coords = { x: number; y: number };

declare type Spell = {
  id: number,
  name: string,
  effectId: number,
  potency: number
}
declare type Modifier = {
  id: number,
  name: string,
  modifierStatType: ModifierStatType,
  modifierPotency: number
}

declare enum Status {
  sleep,
  paralyzed,
  blinded,
  confused,
  fainted
}

declare enum ModifierStatType {
  strength, stamina, speed, intellect, wisdom, dexterity, hp, mp
}

declare type EnemyConfigObject = { id: number; name: string; spriteKey: string; hp: number; mp: number; level: number; intellect: number; dexterity: number; strength: number; wisdom: number; stamina: number; lootTable: Item[]; experiencePoints: number; goldValue: number; spells?: Spell[]; }