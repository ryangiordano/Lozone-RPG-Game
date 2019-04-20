import { DialogPanelContainer } from "./DialogPanelContainer";

export class UserInterface extends Phaser.GameObjects.Container {
  private dialogPanelContainers: DialogPanelContainer[] = [];
  private caret: Phaser.GameObjects.Text;
  private focusedPanel: DialogPanelContainer;
  private panelTravelHistory: DialogPanelContainer[] = [];
  constructor(protected scene: Phaser.Scene, private spriteKey: string) {
    super(scene, 0, 0);
    this.name = 'UI';
    this.createCaret();
    scene.add.existing(this);
    this.setKeyboardListeners();
  }

  closeUI() {
    this.scene.events.emit('close');
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
    this.caret.x = parentPanel.x + focusedOption.x + 5;
    this.caret.y = parentPanel.y + focusedOption.y;

    this.moveTo(this.caret, this.list.length - 1);

  }
  public createPanel(dimensions: Coords, position: Coords, escapable?: boolean) {
    const panel = new DialogPanelContainer(
      dimensions, position,
      this.spriteKey,
      this.scene,
      escapable
    );
    this.add(panel);
    this.dialogPanelContainers.push(panel);
    return panel;
  }
  public addPanel(panel: DialogPanelContainer) {
    this.add(panel);
    this.dialogPanelContainers.push(panel);
    return panel;
  }
  findFocusedPanel() {
    return this.dialogPanelContainers.find(d => d.focused);
  }
  focusPanel(toFocus: DialogPanelContainer) {
    this.focusedPanel = toFocus;

    this.dialogPanelContainers.forEach(panel => {
      if (panel.id === toFocus.id) {
        panel.focusPanel();
      } else {
        panel.blurPanel();
      }
    })
    this.focusedPanel.focusOption(0);
    this.setCaret();
  }
  showPanel(panel: DialogPanelContainer) {
    this.panelTravelHistory.push(panel);
    panel.showPanel();
    return this;
  }
  closePanel(panel: DialogPanelContainer) {
    this.panelTravelHistory.pop();
    panel.closePanel();
    if (this.panelTravelHistory.length) {
      this.focusPanel(this.panelTravelHistory[this.panelTravelHistory.length - 1]);
    } else {
      this.scene.events.emit('close');
    }
    return this;
  }
  setKeyboardListeners() {
    this.scene.input.keyboard.on('keydown', (event) => this.setKeyboardEvents(event));
  }
  removeKeyboardListeners() {
    this.scene.input.keyboard.off('keydown', (event) => this.setKeyboardEvents(event));
  }
  traverseBackward() {
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
  private setKeyboardEvents(event) {
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
