import { EquipmentSlot } from "./../entities/Items/Equipment";
import { Equipment } from "../entities/Items/Equipment";

export default class EquipmentSlotUI extends Phaser.GameObjects.Container {
  private slot: Phaser.GameObjects.Rectangle;
  private inSlot: Equipment;
  private equipmentSprite: Phaser.GameObjects.Sprite;
  constructor(
    scene: Phaser.Scene,
    position: Coords,
    private equipmentSlotType: EquipmentSlot,
    equipment?: Equipment
  ) {
    super(scene, position.x, position.y);
    this.slot = new Phaser.GameObjects.Rectangle(scene, 0, 0, 25, 25, 0xbfbfbf);
    scene.add.existing(this);
    scene.add.existing(this.slot);
    this.add(this.slot);

    if (equipment) {
      this.setEquipmentSprite(equipment);
    }
  }

  private setEquipmentSprite(equipment: Equipment) {
    this.equipmentSprite = new Phaser.GameObjects.Sprite(
      this.scene,
      0,
      0,
      equipment.spriteKey
    );
    this.scene.add.existing(this.equipmentSprite);
    this.equipmentSprite.setOrigin(0.5, 0.5);
    this.equipmentSprite.setScale(0.5, 0.5);
    this.equipmentSprite.setFrame(equipment.frame);
    this.add(this.equipmentSprite);
  }

  public setEquipment(equipment: Equipment) {
    if (this.equipmentSlotType === equipment.getSlot()) {
      this.setEquipmentSprite(equipment);
    }
  }
}
