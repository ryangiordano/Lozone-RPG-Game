import { lesserHeal } from "../components/effect-animations/lesser-heal";
import { flame } from "../components/effect-animations/flame";
import {
  hitEffect,
  deathEffect,
  criticalHitEffect,
} from "../components/effect-animations/hit-effect";
import { explosion } from "../components/effect-animations/explosion";
import { fainted } from "../components/effect-animations/fainted";
import { cloud } from "../components/effect-animations/cloud";

export const effectDatabase = {
  "1": {
    id: 1,
    name: "Lesser Heal",
    play: lesserHeal,
  },
  "2": {
    id: 2,
    name: "Flame",
    play: flame,
  },
  "3": {
    id: 3,
    name: "Hit",
    play: hitEffect,
  },
  "4": {
    id: 4,
    name: "Explosion",
    play: explosion,
  },
  "5": {
    id: 5,
    name: "Death Effect",
    play: deathEffect,
  },
  "6": {
    id: 6,
    name: "Fainted",
    play: fainted,
  },
  "7": {
    id: 6,
    name: "Cloud",
    play: cloud,
  },
  "8": {
    id: 8,
    name: "Critical Hit",
    play: criticalHitEffect,
  },
};
