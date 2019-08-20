import { getUID } from "../../utility/Utility";

export class PanelContainer extends Phaser.GameObjects.Container {
  public panel: Phaser.GameObjects.RenderTexture;
  public focused: boolean = false;
  public options: DialogListItem[] = [];
  public padding: number = 6;
  public childPanels: Map<string, PanelContainer>;

  constructor(
    public dimensions: Coords,
    public pos: Coords,
    private spriteKey: string,
    public scene: Phaser.Scene,
    public id: string = getUID(),
  ) {
    super(scene, pos.x * 64, pos.y * 64);
    this.constructPanel(scene);
    this.name = id.toString();
    scene.add.existing(this);
    this.childPanels = new Map<string, PanelContainer>();
    this.closePanel();

  }

  public constructPanel(scene: Phaser.Scene) {
    this.panel = scene.add.nineslice(0, 0, this.dimensions.x * 64, this.dimensions.y * 64, this.spriteKey, 20);
    this.add(this.panel)
  }

  public showPanel() {
    this.visible = true;
    this.showChildren();
  }

  public closePanel() {
    this.visible = false;
    this.hideChildren();
  }

  public getPanel() {
    return this.panel;
  }

  public focusPanel() {
    if (this.visible) {
      this.focused = true;
      this.alpha = 1;
      this.showChildren();
    } else {
      console.error(`Panel ${this.id} is not visible`);
    }
  }

  public showChildren() {
    this.childPanels.forEach(panel => panel.showPanel())
  }

  public hideChildren() {
    this.childPanels.forEach(panel => panel.closePanel())
  }

  public blurPanel() {
    this.focused = false;
    this.alpha = 0.9;
    this.hideChildren();
  }

  public addChildPanel(name: string, panel: PanelContainer) {
    if (this.childPanels.has(name)) {
      console.warn(`A panel with the name ${name} already exists`);
    } else {
      this.childPanels.set(name, panel);
    }
    return this;
  }

  public removeChildPanel(name, panel) {
    this.childPanels.delete(name);
  }
  public clearPanelContainerByType(type: string) {
    this.getAll('type', type).forEach(child => {
      child.destroy()
    });
  }
  public clearPanelContainerByTypes(types: string[]) {
    types.forEach(type=>this.clearPanelContainerByType(type));
  }
}

export class UIPanel extends PanelContainer {
  constructor(dimensions: Coords,
    pos: Coords,
    spriteKey: string,
    scene: Phaser.Scene,
    public escapable: boolean = true,
    id?: string) {
    super(dimensions, pos, spriteKey, scene, id);
  }

  public addOption(text: string, selectCallback: Function, focusCallback?: Function): UIPanel {
    const lastItem = <Phaser.GameObjects.Text>this.options[this.options.length - 1];
    const x = 0;
    const y = lastItem ? lastItem.y + 40 : 20;
    const toAdd = new DialogListItem(this.scene, x, y, text, {
      fontFamily: 'pixel',
      fontSize: '32px',
      fill: '#000000',
    }, selectCallback, focusCallback);
    toAdd.setPadding(30, 0, 0, 0);
    this.add(toAdd);
    this.options.push(toAdd)
    return this;
  }

  public removeListItem(name: string) {
    this.options.filter(listItem => listItem.name !== name);
  }

  public focusOption(index: number) {
    this.options.forEach((option, i) => {
      if (i === index) {
        option.focused = true;
        option.focus();
      } else {
        option.focused = false;
      }
    });
  }

  public focusNextOption() {
    const index = this.getFocusIndex();
    const toFocus = index >= this.options.length - 1 ? 0 : index + 1;
    this.focusOption(toFocus);
  }

  public getFocusIndex() {
    const current = this.options.find(opt => opt.focused);
    return this.options.findIndex(opt => opt === current);
  }

  public focusPreviousOption() {
    const index = this.getFocusIndex();
    const toFocus = index <= 0 ? this.options.length - 1 : index - 1;
    this.focusOption(toFocus);
  }

  public getFocusedOption() {
    const option = this.options.find(opt => opt.focused);
    if (option) {
      return option;
    }
  }

  public selectFocusedOption() {
    const toSelect = this.getFocusedOption();
    if (toSelect && !toSelect.disabled) {
      toSelect.select();
    }
  }
}


class DialogListItem extends Phaser.GameObjects.Text {
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
    private focusCallback?: Function,
    private dialogData?: any) {
    super(scene, x, y, text, styles);
  }

  public select() {
    if (!this.disabled) {
      this.selectCallback(this.dialogData);
    }
  }

  public focus() {
    if (!this.disabled && this.focusCallback) {
      this.focusCallback(this.dialogData);
    }
  }

}

