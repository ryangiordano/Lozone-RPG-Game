import { Repository } from "./Repository";
import { Dialog } from "../../components/UI/Dialog";

export type InteractiveTypes = "item-switch" | "switch" | "trigger";

export interface InteractiveDTO {
  name: string;
  description: string;
  spriteKey: string;
  keyItemId: number;
  frame: number;
  activeFrame: number;
  category: InteractiveTypes;
  sound: string;
  color: string;
  flagId: number;
  defaultDialogId: number;
  activateDialogId: number;
  validDialogId: number;
}

export class InteractivesRepository extends Repository<InteractiveDTO> {
  constructor(game) {
    const dialog = game.cache.json.get("interactives");
    super(dialog);
  }
  getInteractiveById(id: number | string) {
    return this.getById(id);
  }
}
