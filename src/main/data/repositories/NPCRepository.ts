import { Repository } from "./Repository";

export interface NPCData {
    name: string,
    spriteKey: string,
    description: string,
    dialog: NPCDialog[],
    x: number,
    y: number
}

export interface NPCDialog {
    id: number,
    flags: number[],
    default: boolean,
    message?: string[]
}
export class NPCRepository extends Repository<NPCData>{
    constructor(game) {
        const npcs = game.cache.json.get('npc');
        super(npcs);
    }

}
