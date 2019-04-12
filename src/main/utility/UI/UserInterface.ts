import { DialogPanelContainer } from "./DialogPanelContainer";

// User interface: Container>
// DialogPanelContainer : Container>
//Render texture and text.

export class UserInterface extends Phaser.GameObjects.Container {
  private dialogPanelContainers: DialogPanelContainer[] = [];
  private caret: Phaser.GameObjects.Text;

  constructor(protected scene: Phaser.Scene, private spriteKey: string) {
    super(scene, 0, 0);
    this.name = 'UI';
    this.createCaret();
    scene.add.existing(this);
  }

  closeUI() {
    this.scene.events.emit('close');
  }
  public createPanel(dimensions: Coords, position: Coords) {
    const panel = new DialogPanelContainer(
      dimensions, position,
      this.spriteKey,
      this.scene
    );
    this.add(panel);
    return panel;
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
    const panel = this.findActivePanel();
    const current = this.findFocusedElementInActivePanel();
    const x = panel.pos.x * 16;
    this.caret.x = 30;
    this.caret.y = 50;
  }
  findActivePanel() {
    return this.dialogPanelContainers.find(d => d.active);
  }
  findFocusedElementInActivePanel(): Phaser.GameObjects.Text {
    const activePanel = this.findActivePanel();
    if (activePanel) {
      return activePanel.getFocusedTextItem();
    }
    return null;
  }
  makePanelActive({ id }) {
    this.dialogPanelContainers.forEach((panel) => {
      if (panel.id === id) {
        panel.makeActive();
      } else {
        panel.makeInactive();
      }
      this.setCaret();
    });
  }
}
