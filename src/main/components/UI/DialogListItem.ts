import { Selectable } from "./UserInterface";
export class DialogListItem extends Phaser.GameObjects.Text
  implements Selectable {
  public disabled: boolean;
  public focused: boolean = false;
  //TODO: Refactor this into a separate class for dialog confirm panels and confirm panel Options
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    public text: string,
    styles,
    public selectCallback: Function,
    public focusCallback?: Function,
    public selectableData?: any
  ) {
    super(scene, x, y, text, styles);
  }

  public select() {
    if (!this.disabled) {
      this.selectCallback(this.selectableData);
    }
  }

  public focus() {
    if (!this.disabled && this.focusCallback) {
      this.focusCallback(this.selectableData);
    }
  }
}
