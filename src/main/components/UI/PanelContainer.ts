import { getUID } from "../../utility/Utility";
import { Traversible } from "./UserInterface";
import { KeyboardControlKeys } from "./Keyboard";

export class PanelContainer extends Phaser.GameObjects.Container
  implements Traversible {
  public panel: Phaser.GameObjects.RenderTexture;
  public focused: boolean = false;
  public padding: number = 6;
  public childPanels: Map<string, PanelContainer>;

  constructor(
    public dimensions: Coords,
    public pos: Coords,
    private spriteKey: string,
    public scene: Phaser.Scene,
    public id: string = getUID()
  ) {
    super(scene, pos.x * 64, pos.y * 64);
    this.constructPanel(scene);
    this.name = id.toString();
    scene.add.existing(this);
    this.childPanels = new Map<string, PanelContainer>();
    this.close();
  }

  public constructPanel(scene: Phaser.Scene) {
    this.panel = scene.add.nineslice(
      0,
      0,
      this.dimensions.x * 64,
      this.dimensions.y * 64,
      this.spriteKey,
      20
    );
    this.add(this.panel);
  }

  public show() {
    this.visible = true;
    this.showChildren();
  }

  public close() {
    this.visible = false;
    this.handleClose();
    this.hideChildren();
  }

  public getPanel() {
    return this.panel;
  }

  public focus() {
    if (this.visible) {
      this.focused = true;
      this.alpha = 1;
      this.showChildren();
    } else {
      console.error(`Panel ${this.id} is not visible`);
    }
  }

  public showChildren() {
    this.childPanels.forEach((panel) => panel.show());
  }

  public hideChildren() {
    this.childPanels.forEach((panel) => panel.close());
  }

  public blur() {
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
    this.getAll("type", type).forEach((child) => {
      child.destroy();
    });
  }
  public clearPanelContainerByTypes(types: string[]) {
    types.forEach((type) => this.clearPanelContainerByType(type));
  }

  public handleClose() {
    //To Implement;
  }

  public handleKeydown(event: KeyboardControlKeys) {}
}
