import { Combatant } from "./Combatant";
import { PartyController } from "../../data/controllers/PartyController";

export class Party {
  private partyController: PartyController;
  private members: Combatant[] = [];
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
  getParty() {
    return this.members;
  }

}