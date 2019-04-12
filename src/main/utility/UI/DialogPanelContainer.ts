export class DialogPanelContainer extends Phaser.GameObjects.Container {
  public panel: Phaser.GameObjects.RenderTexture;
  public active: boolean = false;
  public listItems: DialogListItem[] = [];
  public listItemGameObjects: Phaser.GameObjects.Text[] = [];
  public padding: number = 6;
  private focusedChildIndex: number = 0;

  constructor(
    public dimensions: Coords,
    public pos: Coords,
    private spriteKey: string,
    public scene: Phaser.Scene,
    public id: number = Math.random() * 500) {
    super(scene, 0, 0);

    this.constructPanel(scene);
    this.hidePanel();
    this.name = id.toString();
    scene.add.existing(this);
  }
  constructPanel(scene: Phaser.Scene) {
    this.panel = scene.add.nineslice(0, 0, this.dimensions.x * 16, this.dimensions.y * 16, this.spriteKey, 5);
    this.add(this.panel)
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
  public addOption(text: string, selectCallback: Function): DialogPanelContainer {
    const lastItem = <Phaser.GameObjects.Text> this.list[this.list.length - 1];
    const x = this.padding;
    const y = lastItem ? lastItem.y + 10 : 10;
    const toAdd = new DialogListItem(this.scene, x, y, text, {
      fontFamily: 'pixel',
      fontSize: '8px',
      fill: '#000000',
    }, selectCallback);
    this.add(toAdd);
    return this;
  }
  removeListItem(name: string) {
    this.listItems.filter(listItem => listItem.name !== name);
  }
  focusListItem(idx: number) {
    const toFocus = this.listItems[idx];
    if (toFocus) {
      this.listItems[idx].focused = true;
    }
    else {
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
    }
    else {
      console.warn(`${toSelect.name} is unselectable.`);
    }
  }
  getFocusedTextItem() {
    return this.listItemGameObjects[this.focusedChildIndex];
  }
  private showListItemsText() {
    this.listItemGameObjects.forEach(item => item.visible = true);
  }
  private hideListItemsText() {
    this.listItemGameObjects.forEach(item => item.visible = false);
  }
  private removeListItems() {
  }
  initialize() {
    return this;
  }
  makeActive() {
    this.setKeyboardListeners();
    this.showPanel();
    this.focusListItem(0);
    this.showListItemsText();
    this.active = true;
  }
  makeInactive() {
    this.removeKeyboardListeners();
    this.active = false;
  }
  setKeyboardListeners() {
    this.scene.input.keyboard.on('keydown', (event) => this.setKeyboardEvents(event));
  }
  removeKeyboardListeners() {
    this.scene.input.keyboard.off('keydown', (event) => this.setKeyboardEvents(event));
  }
  private setKeyboardEvents(event) {
    switch (event.keyCode) {
      case Phaser.Input.Keyboard.KeyCodes.UP:
      case Phaser.Input.Keyboard.KeyCodes.LEFT:
        this.panel.active ? this.focusPrevious() : null;
        break;
      case Phaser.Input.Keyboard.KeyCodes.RIGHT:
      case Phaser.Input.Keyboard.KeyCodes.DOWN:
        this.panel.active ? this.focusNext() : null;
        break;
      case Phaser.Input.Keyboard.KeyCodes.SPACE:
        this.panel.active ? this.selectFocusedItem() : null;
      default:
        break;
    }
  }
}

class DialogListItem extends Phaser.GameObjects.Text {
  public disabled: boolean;
  public focused: boolean;
  constructor(scene: Phaser.Scene, x: number, y: number, public text: string, styles, public selectEvent: Function) {
    super(scene, x, y, text, styles);
  }
  select() {
    if (!this.disabled) {
      this.selectEvent();
    }
  }
}