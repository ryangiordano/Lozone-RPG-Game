import { PanelContainer } from "../../../../components/UI/PanelContainer";
import { Bar, HpBar, MpBar, XpBar } from "../../../../components/UI/Bars";
import { PartyMember } from "../../../../components/battle/PartyMember";
import { TextFactory } from "../../../../utility/TextFactory";
import { Status } from "../../../../components/battle/CombatDataStructures";

export class PartyMemberPanel extends PanelContainer {
  private textFactory;
  private hpBar: Bar;
  private mpBar: Bar;
  private xpBar: Bar;
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
