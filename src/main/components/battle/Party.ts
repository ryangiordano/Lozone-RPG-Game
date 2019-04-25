import { Combatant } from "./Combatant";
import { PartyController } from "../../data/controllers/PartyController";
import { PartyMember } from "./PartyMember";

export class Party {
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