import { UIPanel, PanelContainer } from "./PanelContainer";
import { KeyboardControl } from "./Keyboard";
import { createRandom } from '../../utility/Utility';
import { cursorHover } from '../../utility/tweens/text';

export interface Traversible {
  close: Function,
  show: Function,
  focus: Function
  blur: Function,
  focused: boolean
  id: string,
}

export interface HasOptions {
  addOption: Function,
  removeOption: Function,
  focusOption: Function,
  focusNextOption: Function,
  getFocusIndex: Function,
  focusPreviousOption: Function,
  getFocusedOption: Function,
  selectFocusedOption: Function
}

export interface Selectable {
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

  public addPanel(panel: any) {
    this.add(panel);
    this.panelContainers.push(panel);
    return panel;
  }

  public findFocusedPanel() {
    return this.panelContainers.find(d => d.focused);
  }
  public focusPanel(toFocus: any) {
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

  showPanel(panel: any) {
    this.travelHistory.push(panel);
    panel.show();
    return this;
  }

  closePanel(panel: any) {
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

//TODO: Find a way to compose this class...All of these methods exist on other classes.  Don't want to make a really deep heirarchy.
export class TraversibleObject extends Phaser.GameObjects.Container implements Traversible, HasOptions {
  public id: string = `Traversible-${createRandom(1000)}`;
  public focused: boolean = false;
  private options: any[] = []
  private cursor: Phaser.GameObjects.Sprite;
  public escapable: boolean = true;
  private cursorAnimation: any;
  constructor(scene) {
    super(scene);
    this.cursor = new Phaser.GameObjects.Sprite(this.scene, 100, 100, 'cursor');
    this.scene.add.existing(this.cursor)
    this.cursorAnimation = cursorHover(this.cursor, 0, this.scene,()=>{});
    this.showCursor(false)
    //TODO: The cursor does not belong here.  The cursor belongs in the combat grid.  We should instantiate, show, hide, and move the cursor there, not here.;
  }

  public show() {
    this.setActive(true);
  }

  public close() {
    this.setActive(false);

  }
  public focus() {
    if (this.active) {
      this.focused = true;
    }
  }
  public blur() {
    this.focused = false;
  }

  public setCursor(coords: Coords, container: Phaser.GameObjects.Container) {
    this.showCursor(true);
    if (container) {
      container.add(this.cursor);
    }
    this.cursor.x = coords.x;
    this.cursor.y = coords.y
    console.log(coords)
  }

  public showCursor(visible: boolean) {
    this.cursor.visible = visible;
    this.cursorAnimation.stop();
    if (visible) {
      this.cursorAnimation.play();
    }
  }

  public addOption(optionData: any, selectCallback: Function, focusCallback?: Function): TraversibleObject {
    const toAdd = new TraversibleListItem(selectCallback, focusCallback, optionData)
    this.options.push(toAdd);
    return this;
  };

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
  public removeOption(name: string) {
    //TODO: Implement if needed?
  }
}

export class TraversibleListItem implements Selectable {
  public focused: boolean = false;
  public disabled: boolean;

  constructor(public selectCallback, public focusCallback, public selectableData?: any) {

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