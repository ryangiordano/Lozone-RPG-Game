import { Repository } from "./Repository";
import { Combatant } from "../../components/battle/Combatant";

export class PartyRepository extends Repository<Combatant> {
  constructor(game: Phaser.Game) {
    const partyMembers = game.cache.json.get('party-members')
    super(partyMembers);
    
  }
}
