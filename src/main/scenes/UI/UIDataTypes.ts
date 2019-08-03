import { Effect } from '../../components/battle/CombatDataStructures';
import { Combatant } from '../../components/battle/Combatant';
import { Item } from '../../components/entities/Item';
export enum PartyMenuTypes {
    itemUse,
    statusCheck,
    spellCast,
    itemEquip
}
export interface PartyMenuConfig {
    type:PartyMenuTypes
    entity: any
}

/**
 * @param: effect {Effect} The effect to be applied to the Combatant
 * @param: entity {Combatant} The entity receiving the effect
 */
export interface PartyMenuAction {
    effect: Effect;
    entity: Combatant
}