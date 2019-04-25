import { State } from "../../utility/state/State";
import { CombatSprite } from "../../components/battle/combat-grid/CombatSprite";
import { Item } from "../../components/entities/Item";

export class CombatMenuScene extends Phaser.Scene {
  private callingSceneKey: string;
  private enemies: CombatSprite[];
  private partyMember:CombatSprite[];
  private items: Item[];
  constructor() {
    super({ key: 'BattleMenuScene' });

  }
  init(data) {
    this.callingSceneKey = data.callingSceneKey;
    //we need list of items,list of enemies,party member data where we can get list of spells and skills
    this.enemies = data.enemies;
    this.partyMember = data.partyMember;
    const sm = State.getInstance();
    this.items = sm.getItemsOnPlayer();

  }
  closeMenu() {
    this.scene.setActive(true, this.callingSceneKey);
    this.scene.stop();
  }
}