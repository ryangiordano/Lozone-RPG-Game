import { UIPanel, PanelContainer } from "./PanelContainer";
import { KeyboardControl } from "./Keyboard";

export class UserInterface extends Phaser.GameObjects.Container {
  private panelContainers: PanelContainer[] = [];
  private caret: Phaser.GameObjects.Text;
  private focusedPanel: UIPanel;
  private panelTravelHistory: UIPanel[] = [];
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
    toFocus.showPanel();
    this.focusedPanel = toFocus;

    this.panelContainers.forEach(panel => {
      if (panel.id === toFocus.id) {
        panel.focusPanel();
      } else {
        panel.blurPanel();
      }
    });
    this.focusedPanel.focusOption(0);
    this.setCaret();
  }

  showPanel(panel: UIPanel) {
    this.panelTravelHistory.push(panel);
    panel.showPanel();
    return this;
  }

  closePanel(panel: UIPanel) {
    this.panelTravelHistory.pop();
    console.log(panel)
    panel.closePanel();
    if (this.panelTravelHistory.length) {
      this.focusPanel(
        this.panelTravelHistory[this.panelTravelHistory.length - 1]
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
    if (this.panelTravelHistory[this.panelTravelHistory.length - 1].escapable) {
      const lastPanel = this.panelTravelHistory.pop();
      lastPanel.closePanel();
      if (this.panelTravelHistory.length) {
        this.focusPanel(
          this.panelTravelHistory[this.panelTravelHistory.length - 1]
        );
      } else {
        this.closeUI();
      }
    }
  }
}
