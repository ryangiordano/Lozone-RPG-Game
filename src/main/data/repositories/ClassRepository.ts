import { Repository } from "./Repository";
import { CombatClass } from '../../components/battle/PartyMember';

export class CombatClassRepositgory extends Repository<CombatClass> {
  constructor(game: Phaser.Game) {
    const CombatClass = game.cache.json.get('classes')
    super(CombatClass);
    
  }
}
