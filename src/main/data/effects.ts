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
import { poison } from "../components/effect-animations/poison";
import { powerUp } from "../components/effect-animations/power-up";
import { flamePowerUp } from "../components/effect-animations/flame-power-up";

export const effectDatabase = {
  "1": {
    name: "Lesser Heal",
    play: lesserHeal,
  },
  "2": {
    name: "Flame",
    play: flame,
  },
  "3": {
    name: "Hit",
    play: hitEffect,
  },
  "4": {
    name: "Explosion",
    play: explosion,
  },
  "5": {
    name: "Death Effect",
    play: deathEffect,
  },
  "6": {
    name: "Fainted",
    play: fainted,
  },
  "7": {
    name: "Cloud",
    play: cloud,
  },
  "8": {
    name: "Critical Hit",
    play: criticalHitEffect,
  },
  "9": {
    name: "Poison",
    play: poison,
  },
  "10": {
    name: "Power Up",
    play: powerUp,
  },
  "11": {
    name: "Flame Power Up",
    play: flamePowerUp,
  },
};
