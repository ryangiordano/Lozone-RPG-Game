import { UIPanel, PanelContainer } from "./PanelContainer";
import { KeyboardControl, KeyboardControlKeys } from './Keyboard';
import { createRandom } from '../../utility/Utility';
import { cursorHover } from '../../utility/tweens/text';
import { TargetType, TargetArea } from '../../data/repositories/SpellRepository';

export interface Traversible {
  close: Function,
  show: Function,
  focus: Function
  blur: Function,
  focused: boolean
  id: string,
  handleClose: Function
}

export interface HasOptions {
  addOption: Function,
  removeOption: Function,
  focusOption: Function,
  focusNextOption: Function,
  getFocusIndex: Function,
  focusPreviousOption: Function,
  getFocusedOption: Function,
  selectFocusedOption: Function,
  onKeyDown: Function
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

/**
 * Creates a panel-based menu system for executing actions in the game world.
 * Initialize in your scene's init function.
 * Suggested to create a factory for initializing it
 */
export class UserInterface extends Phaser.GameObjects.Container {
  private panelContainers: PanelContainer[] = [];
  private keyboardKeys: KeyboardControlKeys[] = [KeyboardControlKeys.UP, KeyboardControlKeys.DOWN, KeyboardControlKeys.LEFT,
  KeyboardControlKeys.RIGHT,
  KeyboardControlKeys.ESC,
  KeyboardControlKeys.SPACE];
  private focusedPanel: UIPanel;
  private travelHistory: UIPanel[] = [];
  private keyboardMuted: boolean = false;
  public events = new Phaser.Events.EventEmitter();

  constructor(
    protected scene: Phaser.Scene,
    protected spriteKey: string,
    private menuSceneKeyboardControl: KeyboardControl
  ) {
    super(scene, 0, 0);
    this.name = "UI";
    scene.add.existing(this);
  }
  /**
   * Set keyboard event listeners for the UI
   */
  public initialize() {
    this.setKeyboardListeners();
  }
  closeUI() {
    this.scene.events.emit("close");
  }

  destroyContainer() {
    this.removeKeyboardListeners();
    this.destroy();
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
    this.keyboardKeys.forEach(key => this.menuSceneKeyboardControl.on(key, "user-interface", () => this.focusedPanel.onKeyDown(key)));
  }

  public removeKeyboardListeners() {
    this.keyboardKeys.forEach(key => this.menuSceneKeyboardControl.off(key, "user-interface"))
  }

  public traverseBackward() {
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
  public escapable: boolean = true;
  private targetingMode: TargetArea;
  constructor(scene, private onClose?: Function) {
    super(scene);
    this.targetingMode = TargetArea.single;
  }

  public show() {
    this.setActive(true);
  }

  public close() {
    this.setActive(false);
    this.handleClose();
  }
  public focus() {
    if (this.active) {
      this.focused = true;
    }
    this.focusOption(0);
  }
  public blur() {
    this.focused = false;
  }


  public addOption(optionData: any, selectCallback: Function, focusCallback?: Function): TraversibleObject {
    const toAdd = new TraversibleListItem(selectCallback, focusCallback, optionData);
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


  public setAllTarget() {
    this.emit('all-chosen', this.options);
  }

  setTargetAll(set: boolean) {
    this.targetingMode = set ? TargetArea.all : TargetArea.single;
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
    if (this.targetingMode === TargetArea.all) {
      return this.emit('all-chosen');
    }
    const toSelect = this.getFocusedOption();
    if (toSelect && !toSelect.disabled) {
      toSelect.select();
    }
  }
  public removeOption(name: string) {
    //TODO: Implement if needed?
  }

  public handleClose() {
    this.onClose && this.onClose()
  }

  public onKeyDown(key: KeyboardControlKeys) {
    switch (key) {
      case KeyboardControlKeys.UP:
      case KeyboardControlKeys.LEFT:
        this.focusPreviousOption();
        break;
      case KeyboardControlKeys.DOWN:
      case KeyboardControlKeys.RIGHT:
        this.focusNextOption();
        break;
      case KeyboardControlKeys.SPACE:
        this.selectFocusedOption()
        break;
      case KeyboardControlKeys.ESC:
        this.emit('escape')
        break;
    }
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