import { lesserHeal } from "./lesser-heal";
import { hitEffect, deathEffect } from "./hit-effect";
import { flame } from "./flame";
import { explosion } from "./explosion";
import { fainted } from "./fainted";
import { cloud } from "./cloud";

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
};
