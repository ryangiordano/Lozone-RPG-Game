import { CombatClassRepositgory } from './../repositories/ClassRepository';
import { PartyRepository } from "../repositories/PartyRepository";
import { PartyMember } from "../../components/battle/PartyMember";

export class PartyController {
  private partyRepository: PartyRepository;
  private combatClassRepository: CombatClassRepositgory;
  constructor(game: Phaser.Game) {
    this.partyRepository = new PartyRepository(game);
    this.combatClassRepository = new CombatClassRepositgory(game);
  }
  getPartyMemberById(partyMemberId: number) {
    const partyMember = this.partyRepository.getById(partyMemberId);
    const combatClass = this.combatClassRepository.getById(partyMember.classId);
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
      currentExperience,
      toNextLevel,
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
      magicalResist,
      combatClass,
      currentExperience,
      toNextLevel,
    );
    return combatant;
  }
}
