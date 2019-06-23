import { CombatAction, CombatActionTypes, CombatResult } from "./CombatDataStructures";
import { Combatant } from "./Combatant";


export const Heal = (executor: Combatant, target: Combatant, potency: number): CombatResult => {
  target.healFor(potency);
  return {
    actionType: CombatActionTypes.heal,
    executor, target,
    resultingValue: potency, 
  }
};

export const ApplyBuff = (executor: Combatant, target: Combatant, buffId: string) => {

};

export const Defend = (executor: Combatant, target: Combatant) => {
  executor.defendSelf();
  return {
    actionType: CombatActionTypes.defend,
    executor: this,
    target: null,
    resultingValue: 0,
    targetDown: null
  }
}

export const PhysicalDamage = (executor: Combatant, target: Combatant, potency: number) => {

}

export const MagicalDamage = (executor: Combatant, target: Combatant) => {

}


// export const actions = new Map<string, CombatAction>([
//   ["0", {
//     name: "",
//     description: "",
//     action(target: Combatant, executor: Combatant, ) {
//       return {

//       };
//     }
//   }]
// ]);