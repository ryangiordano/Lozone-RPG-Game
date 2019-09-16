import { UIPanel, PanelContainer } from "./PanelContainer";
import { KeyboardControl } from "./Keyboard";
import { createRandom } from '../../utility/Utility';

export interface Traversible {
  close: Function,
  show: Function,
  focus: Function
  blur: Function,
  focused: boolean
  id: string,
}

export interface OptionFocusable {
  addOption: Function,
  removeOption: Function,
  focusOption: Function,
  focusNextOption: Function,

}

export interface Selectable {
  name: string,
  focused: boolean,
  disabled: boolean,
  selectableData?: any,
  selectCallback: Function,
  focusCallback?: Function,
  select: Function,
  focus: Function
}

export class UserInterface extends Phaser.GameObjects.Container {
  private panelContainers: PanelContainer[] = [];
  private caret: Phaser.GameObjects.Text;
  private focusedPanel: UIPanel;
  private travelHistory: UIPanel[] = [];
  private keyboardMuted: boolean = false;
  public events = new Phaser.Events.EventEmitter();

  constructor(
    protected scene: Phaser.Scene,
    private spriteKey: string,
    private menuSceneKeyboardControl: KeyboardControl
  ) {
    super(scene, 0, 0);
    this.name = "UI";
    this.createCaret();
    scene.add.existing(this);
  }
  public initialize() {
    this.setKeyboardListeners();
  }
  closeUI() {
    this.scene.events.emit("close");
  }

  destroyContainer() {
    this.removeKeyboardListeners();
    this.caret.destroy();
    this.destroy();
  }

  private createCaret() {
    this.caret = this.scene.add.text(-100, -100, ">", {
      fontFamily: "pixel",
      fontSize: "32px",
      fill: "#000000"
    });
    this.add(this.caret);
  }

  private setCaret() {
    const focusedOption = this.focusedPanel.getFocusedOption();
    const parentPanel = focusedOption.parentContainer;
    if (this.caret && focusedOption && parentPanel) {
      this.caret.x = parentPanel.x + focusedOption.x + 5;
      this.caret.y = parentPanel.y + focusedOption.y;
      this.moveTo(this.caret, this.list.length - 1);
    }
  }

  public createUIPanel(
    dimensions: Coords,
    position: Coords,
    escapable?: boolean
  ): UIPanel {
    const panel = new UIPanel(
      dimensions,
      position,
      this.spriteKey,
      this.scene,
      escapable
    );
    this.add(panel);
    this.panelContainers.push(panel);
    return panel;
  }

  public createPresentationPanel(dimensions, position) {
    const panel = new PanelContainer(
      dimensions,
      position,
      this.spriteKey,
      this.scene
    );
    this.add(panel);
    return panel;
  }

  public addPanel(panel: UIPanel) {
    this.add(panel);
    this.panelContainers.push(panel);
    return panel;
  }

  public findFocusedPanel() {
    return this.panelContainers.find(d => d.focused);
  }
  public focusPanel(toFocus: UIPanel) {
    toFocus.show();
    this.focusedPanel = toFocus;

    this.panelContainers.forEach(panel => {
      if (panel.id === toFocus.id) {
        panel.focus();
      } else {
        panel.blur();
      }
    });
    this.focusedPanel.focusOption(0);
    this.setCaret();
  }

  showPanel(panel: UIPanel) {
    this.travelHistory.push(panel);
    panel.show();
    return this;
  }

  closePanel(panel: UIPanel) {
    this.travelHistory.pop();
    panel.close();
    if (this.travelHistory.length) {
      this.focusPanel(
        this.travelHistory[this.travelHistory.length - 1]
      );
    } else {
      this.scene.events.emit("close");
    }
    return this;
  }

  setEventOnPanel(
    panel: PanelContainer,
    eventName: string,
    callback: Function
  ) {
    this.scene.input.keyboard.on(eventName, event => {
      if (this.focusedPanel.id === panel.id) {
        callback(event);
      }
    });
  }

  public muteKeyboardEvents(muted: boolean) {
    this.keyboardMuted = muted;
  }

  private setKeyboardListeners() {
    this.menuSceneKeyboardControl.setupKeyboardControl();
    this.menuSceneKeyboardControl.on(["up", "left"], "user-interface", () => {
      this.focusedPanel.focusPreviousOption();
      this.setCaret();
      this.events.emit('menu-traverse');
    });
    this.menuSceneKeyboardControl.on(
      ["down", "right"],
      "user-interface",
      () => {
        this.focusedPanel.focusNextOption();
        this.setCaret();
        this.events.emit('menu-traverse');
      }
    );
    this.menuSceneKeyboardControl.on("esc", "user-interface", () => {
      this.traverseBackward();
    });
    this.menuSceneKeyboardControl.on("space", "user-interface", () => {
      this.focusedPanel.selectFocusedOption();
      this.setCaret();
      this.events.emit('menu-select');
    });
  }

  public removeKeyboardListeners() {
    this.menuSceneKeyboardControl.off("up", "user-interface");
    this.menuSceneKeyboardControl.off("left", "user-interface");
    this.menuSceneKeyboardControl.off("down", "user-interface");
    this.menuSceneKeyboardControl.off("right", "user-interface");
    this.menuSceneKeyboardControl.off("esc", "user-interface");
    this.menuSceneKeyboardControl.off("space", "user-interface");
  }

  private traverseBackward() {
    if (this.travelHistory[this.travelHistory.length - 1].escapable) {
      const lastPanel = this.travelHistory.pop();
      lastPanel.close();
      if (this.travelHistory.length) {
        this.focusPanel(
          this.travelHistory[this.travelHistory.length - 1]
        );
      } else {
        this.closeUI();
      }
    }
  }
}

// 
export class TraversibleObject extends Phaser.GameObjects.GameObject implements Traversible, OptionFocusable {
  public id: string = `Traversible-${createRandom(1000)}`;
  public focused: boolean = false;
  constructor(scene, private listItems: any) {
    super(scene, 'TraversibleObject');
    console.log(this.listItems)
  }

  public close() {
    console.log("To Implement")
  }

  public show() {
    console.log("To Implement")
  }

  public blur() {
    console.log("To Implement")
  }

  public focus() {
    console.log("To Implement")
  }

  public addOption() {

  };
  public removeOption() {

  };
  public focusOption() {

  };
  public focusNextOption() {

  };
}

export class TraversibleListItem implements Selectable {
  public focused: boolean = false;
  public disabled: boolean;

  constructor(public name: string, public selectCallback, public focusCallback, public selectableData?: any) {

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