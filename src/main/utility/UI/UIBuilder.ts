export class UIBuilder {
  constructor(private scene: Phaser.Scene, private spriteKey: string) {
    const testPanel = this.buildPanel({ x: 3, y: 9 }, { x: 0, y: 0 });
    testPanel
      .addListItem('Items', () => console.log('Items Selected'))
      .addListItem('Party', () => console.log('Party Selected'))
      .addListItem('Call Mom', () => console.log('Call Mom Selected'))
      .addListItem('Cancel', () => this.closeUI())
      .renderListItems();
  }
  buildPanel(dimensions: Coords, position: Coords) {
    return new DialogPanel(
      dimensions, position,
      this.spriteKey,
      this.scene
    );
  }
  closeUI(){
    this.scene.events.emit('close');
  }
  makePanelActive(target: DialogPanel) {
    //Only make this panel active.
  }
}

class DialogPanel {
  public panel: Phaser.GameObjects.RenderTexture;
  public active: boolean;
  public listItems: DialogListItem[] = [];
  private caret: Phaser.GameObjects.Text;
  private focusedChildIndex: number = 0;
  private padding: number = 3;
  constructor(
    private dimensions: Coords,
    private position: Coords,
    private spriteKey: string,
    private scene: Phaser.Scene
  ) {
    // this.caret = 
    this.constructPanel(scene);
    this.setKeyboardListeners(scene);
  }
  constructPanel(scene: Phaser.Scene) {
    this.panel = scene.add.nineslice(
      this.position.x * 16,
      this.position.y * 16,
      this.dimensions.x * 16,
      this.dimensions.y * 16,
      this.spriteKey, 5);
  }
  setKeyboardListeners(scene: Phaser.Scene) {
    scene.input.keyboard.on('keydown', event => {
      switch (event.keyCode) {
        case Phaser.Input.Keyboard.KeyCodes.UP:
        case Phaser.Input.Keyboard.KeyCodes.LEFT:
          this.focusPrevious();
          break;
        case Phaser.Input.Keyboard.KeyCodes.RIGHT:
        case Phaser.Input.Keyboard.KeyCodes.DOWN:
          this.focusNext();
          break;
        case Phaser.Input.Keyboard.KeyCodes.SPACE:
          this.selectFocusedItem();
        default:
          break;
      }
    })
  }
  hidePanel() {
    this.panel.visible = false;
  }
  showPanel() {
    this.panel.visible = true;
  }
  getPanel() {
    return this.panel;
  }
  addListItem(name: string, selectCallback: Function): DialogPanel {
    this.listItems.push(new DialogListItem(name, selectCallback));
    return this;
  }
  removeListItem(name: string) {
    this.listItems.filter(listItem => listItem.name !== name);
  }
  focusListItem(idx: number) {
    const toFocus = this.listItems[idx];
    if (toFocus) {
      this.listItems[idx].focused = true;
      console.log(`Focusing: ${toFocus.name}`)
    } else {
      console.warn(`List item at ${idx} does not exist`);
    }
  }
  focusNext() {
    this.focusedChildIndex = this.focusedChildIndex >= this.listItems.length - 1 ? 0 : this.focusedChildIndex + 1;
    this.focusListItem(this.focusedChildIndex);
  }
  focusPrevious() {
    this.focusedChildIndex = this.focusedChildIndex <= 0 ? this.listItems.length - 1 : this.focusedChildIndex - 1;
    this.focusListItem(this.focusedChildIndex);
  }
  selectFocusedItem() {
    const toSelect = this.listItems[this.focusedChildIndex];
    if (toSelect && !toSelect.disabled) {
      this.listItems[this.focusedChildIndex].select();
    } else {
      console.warn(`${toSelect.name} is unselectable.`);
    }
  }
  renderListItems() {
    this.listItems.forEach((listItem, idx) => {
      this.scene.add.text((this.position.x+this.padding), 10*idx, listItem.name, {
        fontFamily: 'pixel',
        fontSize: '8px',
        fill: '#000000',
      }
      )
    });
  }
}

class DialogListItem {
  public disabled: boolean;
  public focused: boolean;
  constructor(public name: string, public selectEvent: Function) {

  }
  select() {
    if (!this.disabled) {
      this.selectEvent();
    }
  }
}