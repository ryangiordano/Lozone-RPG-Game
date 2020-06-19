import { PanelContainer } from "../../../../components/UI/PanelContainer";
import { Bar, HpBar, MpBar, XpBar } from "../../../../components/UI/Bars";
import { PartyMember } from "../../../../components/battle/PartyMember";
import { TextFactory } from "../../../../utility/TextFactory";
import { Status } from "../../../../components/battle/CombatDataStructures";
import {
  EquipmentSlot,
  EquipmentType,
  Equipment,
} from "../../../../components/entities/Items/Equipment";
import EquipmentSlotUI from "../../../../components/UI/EquipmentSlotUI";

/**
 * The Panel that shows Party Member name, sprite and HP/MP/XP bars
 */
export class PartyMemberPanel extends PanelContainer {
  private textFactory;
  private hpBar: Bar;
  private mpBar: Bar;
  private xpBar: Bar;
  private weaponSlot: EquipmentSlotUI;
  private armorSlot: EquipmentSlotUI;
  private accessorySlot: EquipmentSlotUI;
  private sprite: Phaser.GameObjects.Sprite;
  constructor(
    dimensions: Coords,
    position: Coords,
    spriteKey = "dialog-white",
    scene,
    public partyMember: PartyMember
  ) {
    super(dimensions, position, spriteKey, scene);
    this.textFactory = new TextFactory(scene);
    this.show();
    this.addSprite();
    this.addName();
    this.createHpBar();
    this.createMpBar();
    this.createXpBar();

    this.weaponSlot = this.createEquipmentSlot(
      this.partyMember.getEquipment()[EquipmentSlot.weapon],
      EquipmentSlot.weapon,
      { x: 25, y: 25 }
    );

    this.armorSlot = this.createEquipmentSlot(
      this.partyMember.getEquipment()[EquipmentSlot.chest],
      EquipmentSlot.chest,
      { x: 25, y: 65 }
    );

    this.accessorySlot = this.createEquipmentSlot(
      this.partyMember.getEquipment()[EquipmentSlot.accessory],
      EquipmentSlot.accessory,
      { x: 165, y: 25 }
    );

    // Hack to get the animation to play on repeat...
    this.sprite.anims.play(`${this.sprite.texture.key}-walkDown`, false);
    this.sprite.anims.stop();
  }

  public addName() {
    const name = this.textFactory.createText(
      this.partyMember.name,
      { x: 15, y: 90 },
      "20px"
    );
    this.scene.add.existing(name);
    this.add(name);
  }
  public addSprite() {
    this.sprite = this.scene.add.sprite(95, 55, this.partyMember.spriteKey, 0);
    this.add(this.sprite);
    this.refreshStatus();
  }

  /**Update the sprite to reflect the current status of the character. */
  public refreshStatus() {
    if (this.partyMember.status.has(Status.fainted)) {
      //TODO: This isn't working.
      this.partyMember.faint();
    }
  }

  public createHpBar() {
    const x = 85,
      y = 130;
    const hpText = this.textFactory.createText("HP", { x: 15, y: 120 }, "13px");
    this.scene.add.existing(hpText);
    this.add(hpText);
    this.add(
      (this.hpBar = new HpBar(
        this.scene,
        { x, y },
        this.partyMember.currentHp,
        this.partyMember.getMaxHp()
      ))
    );
  }

  public createMpBar() {
    const x = 85,
      y = 150;
    const mpText = this.textFactory.createText("MP", { x: 15, y: 140 }, "13px");
    this.scene.add.existing(mpText);
    this.add(mpText);
    this.add(
      (this.mpBar = new MpBar(
        this.scene,
        { x, y },
        this.partyMember.currentMp,
        this.partyMember.getMaxMp()
      ))
    );
  }

  public createXpBar() {
    const x = 85,
      y = 170;
    const xpText = this.textFactory.createText("XP", { x: 15, y: 160 }, "13px");
    this.scene.add.existing(xpText);
    this.add(xpText);
    this.add(
      (this.xpBar = new XpBar(
        this.scene,
        { x, y },
        this.partyMember.currentExperience,
        this.partyMember.getExperienceToNextLevel()
      ))
    );
  }

  public createEquipmentSlot(
    equipment: Equipment,
    equipmentSlotType: EquipmentSlot,
    { x, y }: Coords
  ) {
    const eqs = new EquipmentSlotUI(
      this.scene,
      { x, y },
      equipmentSlotType,
      equipment
    );
    this.add(eqs);
    return eqs;
  }

  public setWeaponSlot(equipment: Equipment) {
    this.weaponSlot.setEquipment(equipment);
  }

  public setAccessorySlot(equipment: Equipment) {
    this.armorSlot.setEquipment(equipment);
  }

  public setArmorSlot(equipment: Equipment) {
    this.accessorySlot.setEquipment(equipment);
  }

  public setHp(newValue: number) {
    this.hpBar.setCurrentValue(newValue);
  }
  public setMp(newValue: number) {
    this.mpBar.setCurrentValue(newValue);
  }

  public setXp(newValue: number) {
    this.xpBar.setCurrentValue(newValue);
  }

  public blur() {
    super.blur();
    this.sprite.anims.stop();
  }

  public focus() {
    super.focus();
    this.sprite.anims.setRepeat(-1);
    // Instead of playing directly, do this in another a function.
    this.sprite.anims.play(`${this.sprite.texture.key}-walkDown`, false);
  }
}
