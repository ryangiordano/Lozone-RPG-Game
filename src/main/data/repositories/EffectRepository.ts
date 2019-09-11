import { Repository } from "./Repository";
import { Effect } from "../../components/battle/CombatDataStructures";
import { effectDatabase } from '../../utility/AnimationEffects/index';


export class EffectsRepository extends Repository<Effect> {
  constructor(game: Phaser.Game) {
    const effects = effectDatabase
    super(effects);
  }
}
