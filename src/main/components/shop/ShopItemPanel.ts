import { ItemPanel } from "../menu/ItemPanel";
import { Item, ItemCategory } from "../entities/Items/Item";
import { TextFactory } from "../../utility/TextFactory";

export class ShopItemPanel extends ItemPanel {
    constructor(
        dimensions: Coords,
        pos: Coords,
        spriteKey: string,
        scene: Phaser.Scene,
        items: Item[],
        itemCategory: ItemCategory
    ) {
        super(dimensions, pos, spriteKey, scene, items, itemCategory);
    }

    public addOptionsViaData() {
        this.items.forEach((item) => {
            if (
                item.category == ItemCategory.consumable ||
                item.category == ItemCategory.equipment ||
                item.category == ItemCategory.loot
            ) {
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
        const { description, frame, spriteKey, value } = item;
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
        const textPrice = textFactory.createText(
            `${value} G`,
            { x: 100, y: 50 },
            "22px",
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
        container.add(textPrice);
        container.add(sprite);
    }

    rebuild(items: Item[]) {
        this.items = items;
        this.refreshPanel();
        this.show()
    }
}
