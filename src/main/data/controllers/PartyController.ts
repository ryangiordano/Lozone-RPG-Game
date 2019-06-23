import { PartyRepository } from "../repositories/PartyRepository";
import { PartyMember } from "../../components/battle/PartyMember";

export class PartyController {
  private partyRepository: PartyRepository;
  constructor(game: Phaser.Game) {
    this.partyRepository = new PartyRepository(game);
  }
  getPartyMemberById(partyMemberId: number) {
    const partyMember = this.partyRepository.getById(partyMemberId);
    // TODO: create a mapping between the database entitity and the entity you'd like to be transformed into.
    const {
      id,
      name,
      spriteKey,
      maxHp: hp,
      maxMp: mp,
      level,
      intellect,
      dexterity,
      strength,
      wisdom,
      stamina,
      physicalResist,
      magicalResist,
    } = partyMember;
    const combatant = new PartyMember(
      id,
      name,
      spriteKey,
      hp,
      mp,
      level,
      intellect,
      dexterity,
      strength,
      wisdom,
      stamina,
      physicalResist,
      magicalResist
    );
    return combatant;
  }
}
