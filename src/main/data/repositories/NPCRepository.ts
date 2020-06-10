import { Repository } from "./Repository";

export interface NPCData {
    name: string,
    spriteKey: string,
    description: string,
    dialog: NPCDialog[],
    placement: NPCPlacement[],
    encounterId: number;
}

export interface NPCDialog {
    id: number,
    flags: number[],
    default: boolean,
    message?: string[]
}

export interface NPCPlacement {
    x: number,
    y: number,
    default: boolean,
    flags: number[]
}
export class NPCRepository extends Repository<NPCData>{
    constructor(game) {
        const npcs = game.cache.json.get('npc');
        super(npcs);
    }

}
