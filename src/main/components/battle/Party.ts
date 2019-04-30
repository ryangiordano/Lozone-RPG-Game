import { Combatant } from "./Combatant";
import { PartyController } from "../../data/controllers/PartyController";
import { PartyMember } from "./PartyMember";
import { Enemy } from "./Enemy";
import { EnemyController } from "../../data/controllers/EnemyController";

export abstract class Party<T> {
  protected members: T[];
  abstract addMemberById(id: number);
  abstract getParty(): T[];
}

export class HeroParty {
  private partyController: PartyController;
  private members: PartyMember[] = [];
  constructor(memberIds: number[], game: Phaser.Game) {
    this.partyController = new PartyController(game);
    memberIds.forEach((id) => this.addMemberById(id));
  }
  addMemberById(id: number) {
    const toAdd = this.partyController.getPartyMemberById(id);
    if (toAdd && !this.members.find(member => member.id === id)) {
      this.members.push(toAdd);
      return true;
    }
    return false;
  }
  getParty(): Combatant[] {
    return this.members;
  }

}

export class EnemyParty extends Party<Enemy>{
  private enemyController: EnemyController;

  constructor(enemyIds: number[], game: Phaser.Game) {
    super();
    this.enemyController = new EnemyController(game);
    enemyIds.forEach((id) => this.addMemberById(id));
  }
  addMemberById(id: number) {
    const toAdd = this.enemyController.getEnemyById(id);
    if (toAdd) {
      this.members.push(toAdd);
      return true;
    }
    return false;
  }
  getParty(): Enemy[] {
    return this.members;
  }
}

