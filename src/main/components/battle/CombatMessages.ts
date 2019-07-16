import { TextFactory } from "../../utility/TextFactory";
import { DialogManager } from "../UI/Dialog";



export class CombatMessages {
    private dialog: DialogManager;
    /**
     * Manages messages during battle.
     */
    constructor(scene: Phaser.Scene) {        
        this.dialog = new DialogManager(scene, ()=>{
            this.handleCombatDialogClose();
        });
    }
    displayMessage(message){
        this.dialog.displayDialog(message);
    }
    dismissMessage(){
        this.handleNextDialog();
    }
}