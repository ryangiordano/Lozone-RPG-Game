import { PartyRepository } from "../repositories/PartyRepository";

export class PartyController {
  private partyRepository: PartyRepository;
  constructor(game: Phaser.Game) {
    this.partyRepository = new PartyRepository(game)

  }
  getPartyMemberById(id:number){
    return this.partyRepository.getById(id);
  }
}
