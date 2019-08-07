import { Combatant } from "./Combatant";
import { PartyController } from "../../data/controllers/PartyController";
import { PartyMember } from "./PartyMember";
import { Enemy } from "./Enemy";
import { EnemyController } from "../../data/controllers/EnemyController";

export abstract class Party<T> {
  protected members: T[] = [];
  abstract addMemberById(id: number);
  abstract getParty(): T[];
}

export class HeroParty {
  private partyController: PartyController;
  private members: PartyMember[] = [];
  constructor(memberIds: number[], game: Phaser.Game) {
    this.partyController = new PartyController(game);
    memberIds.forEach((id) => this.addMemberById(id));
    this.members.forEach(member => member.setParty(this));
  }
  addMemberById(id: number) {
    const toAdd = this.partyController.getPartyMemberById(id);
    console.log(toAdd)
    if (toAdd && !this.members.find(member => member.id === id)) {
      this.members.push(toAdd);
      return true;
    }
    return false;
  }
  getParty(): PartyMember[] {
    return this.members;
  }

}

export class EnemyParty extends Party<Enemy>{
  private enemyController: EnemyController;

  constructor(enemyPartyId: number, game: Phaser.Game) {
    super();
    this.enemyController = new EnemyController(game);
    const enemyPartyIds = this.enemyController.getEnemyPartyById(enemyPartyId);
    enemyPartyIds.forEach((id) => this.addMemberById(id));
    this.members.forEach(member => member.setParty(this));
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

