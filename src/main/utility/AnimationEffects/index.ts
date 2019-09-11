import { lesserHeal } from "./lesser-heal";
import { hitEffect } from './hit-effect';
import { flame } from './flame';

export const effectDatabase = {
    "1": {
        id: 1,
        name: "Lesser Heal",
        animationEffect: lesserHeal
    },
    "2": {
        id: 2,
        name: "Flame",
        animationEffect: flame
    },
    "3": {
        id: 3,
        name: "Hit",
        animationEffect: hitEffect
    }
}