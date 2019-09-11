import { Repository } from "./Repository";
import { Effect } from "../../components/battle/CombatDataStructures";

export enum SpellType {
    restoration,
    attack,
    status
}
export enum TargetArea {
    single, all, row, column, self
}


export enum Targeting {
    ally,
    enemy
}

export type TargetType = {
    target: Targeting,
    targetArea: TargetArea
}

export type SpellData = {
    id: number,
    name: string,
    animationEffect: number
    description: string,
    basePotency: number,
    type: SpellType,
    manaCost: number,
    targetType: TargetType,
    status: any[] //TODO: Implement later;
}

export class SpellRepository extends Repository<SpellData> {
    constructor(game: Phaser.Game) {
        const effects = game.cache.json.get('spells')
        super(effects);
    }
}
