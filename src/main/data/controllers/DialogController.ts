import { DialogRepository } from "../repositories/DialogRepository";

export class DialogController {
  private dialogRepository: DialogRepository;
  constructor(game: Phaser.Game) {
    this.dialogRepository = new DialogRepository(game);
  }
  getDialogById(id:number){
    return this.dialogRepository.getById(id);
  }
}
