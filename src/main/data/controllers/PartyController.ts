import { PartyRepository } from "../repositories/PartyRepository";
import { Combatant } from "../../components/battle/Combatant";
import { PartyMember } from "../../components/entities/PartyMember";

export class PartyController {
  private partyRepository: PartyRepository;
  constructor(game: Phaser.Game) {
    this.partyRepository = new PartyRepository(game)

  }
  getPartyMemberById(partyMemberId: number) {
    const partyMember = this.partyRepository.getById(partyMemberId);
    // TODO: create a mapping between the database entitity and the entity you'd like to be transformed into.
    const { id, name, spriteKey, hp, mp, level, intellect, dexterity, strength, wisdom, stamina } = partyMember;
    const combatant = new Combatant(
      id, name, spriteKey, hp, mp, level, intellect, dexterity, strength, wisdom, stamina
    );
    return combatant;
  }
}
