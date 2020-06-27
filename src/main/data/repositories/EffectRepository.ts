import { Repository } from "./Repository";
import { Effect } from "../../components/battle/CombatDataStructures";
import { effectDatabase } from "../effects";

export class EffectsRepository extends Repository<Effect> {
  constructor(game: Phaser.Game) {
    const effects = effectDatabase;
    super(effects);
  }
  /** Store an effect to play multiple times */
  makeEffect(effect: Effect, args) {
    const cachedArgs = [...args];
    return () => effect.play(...cachedArgs);
  }
}
