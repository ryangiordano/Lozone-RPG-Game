import { NPCRepository, NPCData, NPCDialog } from "../repositories/NPCRepository";
import { DialogRepository } from '../repositories/DialogRepository';


export class NPCController {
    private npcRepository: NPCRepository;
    private dialogRepository: DialogRepository;
    constructor(game: Phaser.Game) {
        this.npcRepository = new NPCRepository(game)
        this.dialogRepository = new DialogRepository(game)
    }
    getNPCById(id: number): NPCData{
        const npc = this.npcRepository.getById(id);

        npc.dialog.map((dialog: NPCDialog) => {
            dialog.message = this.dialogRepository.getById(dialog.id).content;
            return dialog;
        });

        return npc;
    }
}