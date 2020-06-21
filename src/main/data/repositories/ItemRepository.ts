import { Repository } from "./Repository";

export interface ItemData {
  id: number | string;
  name: string;
  description: string;
  spellId: number;
  effectPotency: number;
  spriteKey: string;
  frame: number;
  category: string;
  sound: string;
  flagId?: number;
  value: number;
  placementFlags?: number[];
}

export interface EquipmentData extends ItemData {
  slot: string;
  equipmentType: string;
  classes: number[];
  characters: number[];
  modifiers: any[];
}
export type GenericItem = ItemData & EquipmentData;

export interface ShopInventoryData {
  name:string;
  description:string;
  inventory: number[]
}

export class ItemRepository extends Repository<GenericItem> {
  constructor(game) {
    const items = game.cache.json.get("items");
    super(items);
  }
}
export class EquipmentRepository extends Repository<GenericItem> {
  constructor(game) {
    const items = game.cache.json.get("equipment");
    super(items);
  }
}

export class ShopInventoryRepository extends Repository<ShopInventoryData> {
  constructor(game) {
    const items = game.cache.json.get("shop-inventory");
    super(items);
  }
}