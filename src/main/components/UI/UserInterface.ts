import { UIPanel, PanelContainer } from "./PanelContainer";

export class UserInterface extends Phaser.GameObjects.Container {
  private panelContainers: PanelContainer[] = [];
  private caret: Phaser.GameObjects.Text;
  private focusedPanel: UIPanel;
  private panelTravelHistory: UIPanel[] = [];
  private keyboardMuted: boolean = false;
  constructor(protected scene: Phaser.Scene, private spriteKey: string) {
    super(scene, 0, 0);
    this.name = 'UI';
    this.createCaret();
    scene.add.existing(this);
  }
  public initialize() {
    this.setKeyboardListeners();
  }
  closeUI() {
    this.scene.events.emit('close');
  }

  destroyContainer() {
    this.removeKeyboardListeners();
    this.caret.destroy();
    this.destroy();
  }

  private createCaret() {
    this.caret = this.scene.add.text(-100, -100, ">", {
      fontFamily: 'pixel',
      fontSize: '8px',
      fill: '#000000',
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

  public createUIPanel(dimensions: Coords, position: Coords, escapable?: boolean): UIPanel {
    const panel = new UIPanel(
      dimensions, position,
      this.spriteKey,
      this.scene,
      escapable
    );
    this.add(panel);
    this.panelContainers.push(panel);
    return panel;
  }

  public createPresentationPanel(dimensions, position) {
    const panel = new PanelContainer(dimensions, position, this.spriteKey, this.scene);
    this.add(panel);
    // this.panelContainers.push(panel);
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
    this.focusedPanel = toFocus;

    this.panelContainers.forEach(panel => {
      if (panel.id === toFocus.id) {
        panel.focusPanel();
      } else {
        panel.blurPanel();
      }
    })
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
    panel.closePanel();
    if (this.panelTravelHistory.length) {
      this.focusPanel(this.panelTravelHistory[this.panelTravelHistory.length - 1]);
    } else {
      this.scene.events.emit('close');
    }
    return this;
  }
  private setKeyboardListeners() {
    this.scene.input.keyboard.on('keydown', (event) => this.invokeKeyboardEvent(event));
  }
  setEventOnPanel(panel: PanelContainer, eventName: string, callback: Function) {
    this.scene.input.keyboard.on(eventName, (event) => {
      if (this.focusedPanel.id === panel.id) {
        callback(event);
      }
    })
  }
  public muteKeyboardEvents(muted: boolean) {
    this.keyboardMuted = muted;
  }
  public removeKeyboardListeners() {
    this.scene.input.keyboard.off('keydown');
  }
  private traverseBackward() {
    if (this.panelTravelHistory[this.panelTravelHistory.length - 1].escapable) {
      const lastPanel = this.panelTravelHistory.pop();
      lastPanel.closePanel();
      if (this.panelTravelHistory.length) {
        this.focusPanel(this.panelTravelHistory[this.panelTravelHistory.length - 1]);
      } else {
        this.closeUI();
      }
    }
  }
  private invokeKeyboardEvent(event) {
    switch (event.keyCode) {
      case Phaser.Input.Keyboard.KeyCodes.UP:
      case Phaser.Input.Keyboard.KeyCodes.LEFT:
        this.focusedPanel.focusPreviousOption();
        this.setCaret();
        break;
      case Phaser.Input.Keyboard.KeyCodes.RIGHT:
      case Phaser.Input.Keyboard.KeyCodes.DOWN:
        this.focusedPanel.focusNextOption();
        this.setCaret();
        break;
      case Phaser.Input.Keyboard.KeyCodes.ESC:
        this.traverseBackward();
        break;
      case Phaser.Input.Keyboard.KeyCodes.SPACE:
        this.focusedPanel.selectFocusedOption();
        this.setCaret();
      default:
        break;
    }
  }
}
