import { Dialog } from "./../../components/UI/Dialog";
import {
  InteractivesRepository,
  InteractiveTypes,
} from "./../repositories/InteractivesRepository";
import { DialogRepository } from "../repositories/DialogRepository";
import { InteractiveDTO } from "../repositories/InteractivesRepository";

export interface Interactive {
  name: string;
  description: string;
  /** The spritesheet that the interactive belongs to */
  spriteKey: string;
  /** The key item needed to activate the item switch */
  keyItemId: number;
  /** The frame to show when the interactive is in the inactive state */
  frame: number;
  /** The frame to show when the interactive is in the active state */
  activeFrame: number;
  /** The category of interactive */
  category: InteractiveTypes;
  /** The sound made upon activation */
  sound: string;
  /** The tint of the sprite */
  color: string;
  /** The flag to be flipped when the item is activated */
  flagId: number;
  /** The dialog to display when the switch is inactive */
  defaultDialog: Dialog;
  /** The dialog to display when the switch is activated */
  activateDialog: Dialog;
  /** The dialog to display when the switch is active */
  validDialog: Dialog;
}
export class InteractivesController {
  private interactivesRepository: InteractivesRepository;
  private dialogRepository: DialogRepository;
  constructor(game: Phaser.Game) {
    this.interactivesRepository = new InteractivesRepository(game);
    this.dialogRepository = new DialogRepository(game);
  }
  private buildInterative(interactiveDTO: InteractiveDTO): Interactive {
    const {
      defaultDialogId,
      activateDialogId,
      validDialogId,
      ...restInteractive
    } = interactiveDTO;
    const i: Interactive = {
      ...restInteractive,
      defaultDialog: null,
      activateDialog: null,
      validDialog: null,
    };
    i.defaultDialog = this.dialogRepository.getDialogById(
      interactiveDTO.defaultDialogId
    );
    i.activateDialog = this.dialogRepository.getDialogById(
      interactiveDTO.activateDialogId
    );
    i.validDialog = this.dialogRepository.getDialogById(
      interactiveDTO.validDialogId
    );

    return i;
  }

  getInteractiveById(id: number): Interactive {
    const interactiveFromDB = this.interactivesRepository.getById(id);
    const i = this.buildInterative(interactiveFromDB);
    return i;
  }
}
