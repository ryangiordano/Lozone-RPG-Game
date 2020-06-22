import { GenericItem } from "./../../data/repositories/ItemRepository";
import { TextFactory } from "../../utility/TextFactory";
import { UIPanel } from "../UI/UIPanel";
import { Item, ItemCategory } from "../entities/Items/Item";
import { Equipment } from "../entities/Items/Equipment";
import { ModifierStatType } from "../battle/CombatDataStructures";

export class ConfirmItemPanel extends UIPanel {
  private itemData: GenericItem;
  constructor(
    dimensions: Coords,
    pos: Coords,
    spriteKey: string,
    scene: Phaser.Scene,
    id?: string
  ) {
    super(dimensions, pos, spriteKey, scene, true, id);
  }

  public setPanelData(item: GenericItem) {
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
    protected items: Item[],
    protected itemCategory: ItemCategory
  ) {
    super(dimensions, pos, spriteKey, scene);
    this.addOptionsViaData();
  }

  setPanelData(items: Item[]) {
    this.items = items;
  }

  addOptionsViaData() {
    this.items.forEach((item) => {
      const displayItem = item.category == this.itemCategory;
      if (displayItem) {
        const quantity = item.quantity > 1 ? `x${item.quantity}` : "";
        this.addOption(
          `${item.name} ${quantity}`,
          () => {
            this.emit("item-selected", item);
          },
          () => {
            this.emit("item-focused", item);
          }
        );
      }
    });
    this.addOption(
      "Cancel",
      () => {
        this.emit("panel-close");
      },
      () => {
        this.emit("item-focused", null);
      }
    );
  }

  public updateDisplay(item) {
    const container = this.childPanels.get("item-detail");
    container.clearPanelContainerByTypes(["Text", "Sprite"]);
    if (!item) return;
    const textFactory = new TextFactory(this.scene);
    const { description, frame, spriteKey } = item;
    const textDescription = textFactory.createText(
      description,
      { x: 30, y: 90 },
      "18px",
      {
        wordWrap: {
          width: (this.panel.width / 4.5) * 4,
          useAdvancedWrap: true,
        },
      }
    );
    const sprite = new Phaser.GameObjects.Sprite(this.scene, 50, 50, spriteKey);
    sprite.setFrame(frame);

    container.add(textDescription);
    container.add(sprite);
  }

  public refreshPanel() {
    console.log("refreshing")
    this.destroyCaret();
    this.visible = false;
    this.handleClose();
    this.hideChildren();
    this.createCaret();
    this.pages = this.buildPages();
    this.setVisibilityByCurrentPage();

    this.setCaret();
    this.bringToTop(this.caret);
    this.visible = true;
    this.renderPage();
    this.showChildren();
    this.focusOption(0);

    this.list = this.list.filter((item) => item.type !== "Text");
    this.options = [];
    this.addOptionsViaData();
  }
}

export class EquipmentPanel extends ItemPanel {
  /** Create text for stats to populate the item panel */
  private createStats(item: Equipment): string {
    return [
      { statText: "STR", modifierStatType: "strength" },
      { statText: "STA", modifierStatType: "stamina" },
      { statText: "INT", modifierStatType: "intellect" },
      { statText: "WIS", modifierStatType: "wisdom" },
      { statText: "DEX", modifierStatType: "dexterity" },
      { statText: "HP", modifierStatType: "hp" },
      { statText: "MP", modifierStatType: "mp" },
      {
        statText: "PRES",
        modifierStatType: ModifierStatType.physicalResistance,
      },
      {
        statText: "MRES",
        modifierStatType: ModifierStatType.magicalResistance,
      },
    ]
      .reduce((acc, s, i) => {
        const modifier = item
          .getModifiers()
          .find((m) => m.modifierStatType === s.modifierStatType);
        const boost = (modifier && modifier.modifierPotency) || null;

        if (boost) {
          acc.push(`${s.statText} +${boost} `);
        }
        return acc;
      }, [])
      .join(" ");
  }

  public updateDisplay(item: Equipment) {
    const container = this.childPanels.get("item-detail");
    container.clearPanelContainerByTypes(["Text", "Sprite"]);
    if (!item) return;
    const textFactory = new TextFactory(this.scene);
    const { description, frame, spriteKey } = item;
    const textDescription = textFactory.createText(
      description,
      { x: 30, y: 90 },
      "18px",
      {
        wordWrap: {
          width: (this.panel.width / 4.5) * 4,
          useAdvancedWrap: true,
        },
      }
    );

    const sprite = new Phaser.GameObjects.Sprite(this.scene, 50, 50, spriteKey);
    sprite.setFrame(frame);

    const textStats = textFactory.createText(
      this.createStats(item),
      { x: 30, y: 140 },
      "14px",
      {
        wordWrap: {
          width: (this.panel.width / 4.5) * 4,
          useAdvancedWrap: true,
        },
      }
    );
    container.add(textStats);
    container.add(textDescription);
    container.add(sprite);
  }
}
