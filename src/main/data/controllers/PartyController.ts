import { CombatClassRepositgory } from './../repositories/ClassRepository';
import { PartyRepository } from "../repositories/PartyRepository";
import { PartyMember, CombatClass } from "../../components/battle/PartyMember";
import { SpellController } from './SpellController';

export class PartyController {
  private partyRepository: PartyRepository;
  private combatClassRepository: CombatClassRepositgory;
  private spellController: SpellController;
  constructor(game: Phaser.Game) {
    this.partyRepository = new PartyRepository(game);
    this.combatClassRepository = new CombatClassRepositgory(game);
    this.spellController = new SpellController(game);
  }
  getPartyMemberById(partyMemberId: number) {
    const partyMember = this.partyRepository.getById(partyMemberId);
    const combatClassData = this.combatClassRepository.getById(partyMember.classId);

    const {
      ...pm
    } = partyMember;


    const combatant = new PartyMember(
      pm.id,
      pm.name,
      pm.spriteKey,
      pm.maxHp,
      pm.maxMp,
      pm.level,
      pm.intellect,
      pm.dexterity,
      pm.strength,
      pm.wisdom,
      pm.stamina,
      pm.physicalResist,
      pm.magicalResist,
      this.mapCombatClassDataToCombatClass(combatClassData),
      pm.currentExperience,
      pm.toNextLevel,
    );
    return combatant;
  }

  private mapCombatClassDataToCombatClass(combatClassData): CombatClass {
    const {
      spells,
      ...combatClass
    } = combatClassData

    combatClass.spells = spells.map(spellObject => ({
      ...spellObject,
      spell: this.spellController.getSpellById(spellObject.spell)
    }));

    return combatClass;
  }
}
