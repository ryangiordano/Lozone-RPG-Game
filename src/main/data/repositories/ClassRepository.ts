import { Repository } from "./Repository";
import { CombatClass } from '../../components/battle/PartyMember';

export interface CombatClassData {
  name: string,
  id: number,
  maxHp: number
  maxMp: number
  intellect: number
  dexterity: number
  wisdom: number
  stamina: number
  strength: number
  physicalResist: number
  magicalResist: number,
  spells: ClassSpellData[]
}

export interface ClassSpellData {
  requiredLevel: number,
  classModifier: number,
  spell: number
}
export class CombatClassRepositgory extends Repository<CombatClassData> {
  constructor(game: Phaser.Game) {
    const CombatClass = game.cache.json.get('classes')
    super(CombatClass);
    
  }
}
