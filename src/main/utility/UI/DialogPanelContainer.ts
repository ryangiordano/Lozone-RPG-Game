export class DialogPanelContainer extends Phaser.GameObjects.Container {
  public panel: Phaser.GameObjects.RenderTexture;
  public focused: boolean = false;
  public options: DialogListItem[] = [];
  public padding: number = 6;

  constructor(
    public dimensions: Coords,
    public pos: Coords,
    private spriteKey: string,
    public scene: Phaser.Scene,
    public id: number = Math.random() * 500) {
    super(scene, pos.x * 16, pos.y * 16);

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
    this.visible = false;
  }
  showPanel() {
    this.visible = true;
  }
  getPanel() {
    return this.panel;
  }
  public addOption(text: string, selectCallback: Function): DialogPanelContainer {
    const lastItem = <Phaser.GameObjects.Text>this.list[this.list.length - 1];
    const x = this.padding;
    const y = lastItem ? lastItem.y + 10 : 10;
    const toAdd = new DialogListItem(this.scene, x, y, text, {
      fontFamily: 'pixel',
      fontSize: '8px',
      fill: '#000000',
    }, selectCallback);
    this.add(toAdd);
    this.options.push(toAdd)
    return this;
  }
  removeListItem(name: string) {
    this.options.filter(listItem => listItem.name !== name);
  }
  focusOption(index: number) {
    this.options.forEach((option, i)=>{
      if(i===index){
        option.focused = true;
      }else{
        option.focused = false;
      }
    });
  }
  focusNextOption() {
    const index = this.getFocusIndex();
    const toFocus = index >= this.options.length - 1 ? 0 : index + 1;
    this.focusOption(toFocus);
  }
  getFocusIndex() {
    const current = this.options.find(opt=>opt.focused);
    return this.options.findIndex(opt=>opt===current);

  }
  focusPreviousOption() {
    const index = this.getFocusIndex();
    const toFocus = index <= 0 ? this.options.length - 1 : index - 1;
    this.focusOption(toFocus);
  }
  getFocusedOption() {
    const option = this.options.find(opt => opt.focused);
    if(option){
      return option;
    }
    console.error("Focused ption does not exist");

  }
  selectFocusedOption() {
    const toSelect = this.getFocusedOption();
    if (toSelect && !toSelect.disabled) {
      toSelect.select();
    }
    else {
      console.warn(`${toSelect.name} is unselectable.`);
    }
  }
  focusPanel() {
    this.showPanel();
    this.focusOption(0);
    this.focused = true;
  }
  blurPanel() {
    this.focused = false;
  }

}

class DialogListItem extends Phaser.GameObjects.Text {
  public disabled: boolean;
  public focused: boolean = false;
  constructor(scene: Phaser.Scene, x: number, y: number, public text: string, styles, public selectEvent: Function) {
    super(scene, x, y, text, styles);
  }
  select() {
    if (!this.disabled) {
      this.selectEvent();
    }
  }
}