import { UIPanel } from "../UI/PanelContainer";
import { Item, ItemCategory } from "../entities/Item";
import { TextFactory } from "../../utility/TextFactory";

export class ConfirmItemPanel extends UIPanel {
  private itemData: Item;
  constructor(
    dimensions: Coords,
    pos: Coords,
    spriteKey: string,
    scene: Phaser.Scene,
    id?: string
  ) {
    super(dimensions, pos, spriteKey, scene, true, id);
  }

  public setPanelData(item: Item) {
    this.itemData = item;
  }

  public getPanelData() {
    return this.itemData;
  }
}

export class ItemPanel extends UIPanel {
  constructor(
    dimensions: Coords,
    pos: Coords,
    spriteKey: string,
    scene: Phaser.Scene,
    private items: Item[],
    private itemCategory: ItemCategory
  ) {
    super(dimensions, pos, spriteKey, scene);
    this.addOptionsViaData();
  }

  setPanelData(items: Item[]) {
    this.items = items;
  }

  addOptionsViaData() {
    this.items.forEach(item => {
      const displayItem = item.category == this.itemCategory;
      const consumable = this.itemCategory == ItemCategory.consumable;
      if (displayItem) {
        const quantity = item.quantity > 1 ? `x${item.quantity}` : '';
        this.addOption(`${item.name} ${quantity}`, () => {
          consumable && this.emit("item-selected", item);
        }, () => {
          this.emit("item-focused", item);
        });

      }
    });
    this.addOption("Cancel", () => {
      this.emit("panel-close");
    }, () => {
      this.emit("item-focused", null);
    });
  }

  public updateDisplay(item) {
    const container = this.childPanels.get('item-detail');
    container.clearPanelContainerByTypes(['Text', 'Sprite']);
    if (!item) return;
    const textFactory = new TextFactory(this.scene);
    const { description, frame, spriteKey } = item;
    const textDescription = textFactory.createText(description, { x: 30, y: 90 }, '18px', {
      wordWrap: {
        width: (this.panel.width / 4.5) * 4,
        useAdvancedWrap: true
      }
    })
    const sprite = new Phaser.GameObjects.Sprite(this.scene, 50, 50, spriteKey)
    sprite.setFrame(frame);

    container.add(textDescription);
    container.add(sprite);
  }

  public refreshPanel() {
    this.list = this.list.filter(item => item.type !== "Text");
    this.options = [];
    this.addOptionsViaData();
  }
}
