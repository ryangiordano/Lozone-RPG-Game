import { PanelContainer } from '../../components/UI/PanelContainer';
import { PartyMember } from "../../components/battle/PartyMember";
import { State } from "../../utility/state/State";
import { HeroParty, Party } from "../../components/battle/Party";
import { KeyboardControl } from "../../components/UI/Keyboard";
import { PartyMenuConfig, PartyMenuTypes } from "./UIDataTypes";
import { Combatant } from "../../components/battle/Combatant";
import { TextFactory } from '../../utility/TextFactory';

export class PartyMenuScene extends Phaser.Scene {
  private partyMenuContainer: PartyMenuContainer;
  private callingSceneKey: string;
  constructor() {
    super({ key: "PartyMenuScene" });
  }
  preload(){
    this.sound.add("heal");
  }
  public init(data) {
    const config: PartyMenuConfig = data.config;
    const { type, entity } = config;

    //   Here we will spin up a container.
    // Fill it with party member panels
    this.callingSceneKey = data.callingSceneKey;
    const state = State.getInstance();
    const party = state.getCurrentParty().getParty();
    this.partyMenuContainer = new PartyMenuContainer(
      this,
      { x: 4 * 64, y: 0 },
      party,
      new KeyboardControl(this),
      type,
      entity
    );
    this.partyMenuContainer.on("close-menu", () => {
      this.scene.setActive(true, this.callingSceneKey);
      this.scene.stop();
    });
  }
}

class PartyMenuContainer extends Phaser.GameObjects.Container {
  private partyMemberPanels: any[][] = [];
  private activeIndex: number[] = [0, 0];
  private partyMessagePanel: PartyMessagePanel

  constructor(
    scene: Phaser.Scene,
    private coordinates: Coords,
    private partyMembers: PartyMember[],
    private keyboardControl: KeyboardControl,
    private partyMenuType: PartyMenuTypes,
    private entity: any
  ) {
    super(scene, coordinates.x, coordinates.y);
    this.partyMessagePanel = new PartyMessagePanel(
      scene,
      { x: 6, y: 3 }, { x: 4, y: 6 });
    this.scene.add.existing(this.partyMessagePanel);

    partyMembers.forEach((partyMember, i) => {
      const panelSize = 3;
      const row = Math.floor(i / 2);
      const col = Math.ceil(i % 2) ? panelSize : 0;
      const partyMemberPanel = new PartyMemberPanel(
        {
          x: 3,
          y: 3
        },
        { x: col + 4, y: row * panelSize },
        "dialog-white",
        scene,
        partyMember
      );
      this.partyMemberPanels[row]
        ? this.partyMemberPanels[row].push(partyMemberPanel)
        : this.partyMemberPanels.push([partyMemberPanel]);
      scene.add.existing(partyMemberPanel);
    });
    this.keyboardControl.setupKeyboardControl();
    this.setupKeyboard();

    this.focusActive();
  }
  private setupKeyboard() {
    this.keyboardControl.on("esc", "party-menu-container", () =>
      this.emit("close-menu")
    );
    this.keyboardControl.on("right", "party-menu-container", () =>
      this.focusNext()
    );
    this.keyboardControl.on("down", "party-menu-container", () =>
      this.focusBelow()
    );
    this.keyboardControl.on("up", "party-menu-container", () =>
      this.focusAbove()
    );
    this.keyboardControl.on("left", "party-menu-container", () =>
      this.focusPrevious()
    );
    this.keyboardControl.on("space", "party-menu-container", () => {
      this.selectPartyMember();
    });
  }
  private teardownKeyboard() {
    this.keyboardControl.off("esc", "party-menu-container");
  }

  private focusActive() {
    this.blurAll();
    const currentMember = this.getCurrentlyFocusedPartyMemberPanel();
    currentMember.focusPanel();
    if (this.partyMenuType === PartyMenuTypes.itemUse) {
      this.partyMessagePanel.displayMessage(`Use ${this.entity.name} on ${currentMember.partyMember.name}?`);

    }
    if (this.partyMenuType === PartyMenuTypes.statusCheck) {
      this.partyMessagePanel.populateStatsPanel(currentMember.partyMember);
    }
  }
  private blurAll() {
    this.partyMemberPanels.forEach(row =>
      row.forEach(panel => panel.blurPanel())
    );
  }



  private getCurrentlyFocusedPartyMemberPanel() {
    const i = this.activeIndex;
    return this.partyMemberPanels[i[0]][i[1]];
  }

  public focusNext() {
    const row = this.activeIndex[0];
    const i = this.activeIndex[1] + 1;
    const col = this.partyMemberPanels[row][i] ? i : this.activeIndex[1];
    this.activeIndex = [row, col];
    this.focusActive();
  }
  public focusPrevious() {
    const row = this.activeIndex[0];
    const i = this.activeIndex[1] - 1;
    const col = Math.max(0, i);
    this.activeIndex = [row, col];
    this.focusActive();
  }
  public focusBelow() {
    const i = this.activeIndex[0] + 1;
    const col = this.activeIndex[1];
    const row =
      this.partyMemberPanels[i] && this.partyMemberPanels[i][col]
        ? i
        : this.activeIndex[0];
    this.activeIndex = [row, col];
    this.focusActive();
  }
  public focusAbove() {
    const i = this.activeIndex[0] - 1;
    const col = this.activeIndex[1];
    const row = Math.max(0, i);
    this.activeIndex = [row, col];
    this.focusActive();
  }

  public selectPartyMember() {
    const panel = this.getCurrentlyFocusedPartyMemberPanel()
    const partyMember: PartyMember = panel.partyMember;
    if (this.partyMenuType === PartyMenuTypes.itemUse) {
      // Item use class.  It'll handle MP/HP/other types of consumables.
      const potency = this.entity.effectPotency * this.entity.effect.basePotency;
      const state = State.getInstance();

      //TODO: Refactor this and get it working.  Maybe make a utility class for emitters....;
      const particles = this.scene.add.particles('heal')
      panel.add(particles)
      panel.bringToTop(particles)
      const emitter = particles.createEmitter({});
      emitter.setFrequency(-1)
      particles.emitParticleAt(50, 50)

      if (state.getItemOnPlayer(this.entity.id)) {
        this.partyMessagePanel.displayMessage(`You have no ${this.entity.name} left!`);
      }
      if (partyMember.currentHp < partyMember.getMaxHp()) {
        state.consumeItem(this.entity.id);
        const healedFor = partyMember.healFor(potency);
        this.partyMessagePanel.displayMessage(`Used ${this.entity.name} on ${partyMember.name}.  Recovered ${healedFor} HP.`);
        panel.setHp(partyMember.currentHp);
        this.scene.sound.play("heal", {volume:.1});

      } else {
        this.partyMessagePanel.displayMessage(`${partyMember.name} already has full HP!`);
      }
      return;
    }
    if (this.partyMenuType === PartyMenuTypes.spellCast) {
      //TODO: Handle spell cast
    }
  }

}

class PartyMessagePanel extends PanelContainer {
  private currentText: Phaser.GameObjects.Text;
  /**
   *
   */
  constructor(public scene, dimensions: Coords, position: Coords) {
    super(dimensions, position, 'dialog-white', scene);
    this.showPanel();
    State.getInstance().addItemToContents(3);
    this.clearPanelContainer();
  }

  public populateStatsPanel(member: PartyMember) {
    this.clearPanelContainer()
    // Name, level, hp mp xp to next level, 
    // str, sta, dex, int, wis, 
    //class
    const tf = new TextFactory(this.scene);
    const name = tf.createText(member.name, { x: 20, y: 10 }, '20px');
    const level = tf.createText(
      `Lvl.${member.level} ${member.combatClass.name} - Next Lvl:  ${Math.floor(member.getExperienceToNextLevel() - member.currentExperience)} `,
      { x: 20, y: 35 }, '16px');
    const hp = tf.createText(
      `HP: ${member.currentHp}/${member.getMaxHp()}`,
      { x: 20, y: 60 }, '20px');
    const mp = tf.createText(
      `MP: ${member.currentMp}/${member.getMaxMp()}`,
      { x: 20, y: 85 }, '20px');

    const str = tf.createText(
      `STR: ${member.getStrength()}`,
      { x: 170, y: 60 }, '20px');
    const sta = tf.createText(
      `STA: ${member.getStamina()}`,
      { x: 170, y: 85 }, '20px');
    const dex = tf.createText(
      `DEX: ${member.getDexterity()}`,
      { x: 170, y: 110 }, '20px');
    const int = tf.createText(
      `INT: ${member.getIntellect()}`,
      { x: 285, y: 60 }, '20px');
    const wis = tf.createText(
      `WIS: ${member.getWisdom()}`,
      { x: 285, y: 85 }, '20px');
    this.add([name, level, hp, mp, str, sta, dex, int, wis]);
  }
  /**
   * Function that results after the message scene is done doing its thing.
   * @param message
   */
  public displayMessage(message: string) {
    this.currentText && this.clearPanelContainer();
    this.currentText = this.scene.add.text(
      this.panel.x + 20,
      this.panel.y + 20,
      message,
      {
        fontFamily: "pixel",
        fontSize: "32px",
        fill: "#000000",
        wordWrap: {
          width: (this.panel.width / 4.5) * 4,
          useAdvancedWrap: true
        }
      }
    );
    this.add(this.currentText);
    this.currentText.setScrollFactor(0);
  }
  clearPanelContainer() {
    this.getAll('type', 'Text').forEach(child => {
      child.destroy()
    });
  }

}

class PartyMemberPanel extends PanelContainer {
  private textFactory;
  private hpBar: Bar;
  private mpBar: Bar
  private xpBar: Bar
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
    this.showPanel();
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
    const name = this.textFactory.createText(this.partyMember.name, { x: 15, y: 90 }, '20px');
    this.scene.add.existing(name)
    this.add(name);
  }
  public addSprite() {
    this.sprite = this.scene.add.sprite(95, 55, this.partyMember.spriteKey, 0);
    this.add(this.sprite)

  }

  public createHpBar() {
    const x = 85, y = 130;
    const hpText = this.textFactory.createText('HP', { x: 15, y: 120 }, '13px');
    this.scene.add.existing(hpText);
    this.add(hpText)
    this.add(this.hpBar = new Bar(this.scene, { x, y }, this.partyMember.currentHp, this.partyMember.getMaxHp(), 0xEC7171))
  }

  public createMpBar() {
    const x = 85, y = 150;
    const mpText = this.textFactory.createText('MP', { x: 15, y: 140 }, '13px');
    this.scene.add.existing(mpText);
    this.add(mpText)
    this.add(this.mpBar = new Bar(this.scene, { x, y }, this.partyMember.currentMp, this.partyMember.getMaxMp(), 0x8DDAD8))
  }

  public createXpBar() {
    const x = 85, y = 170;
    const xpText = this.textFactory.createText('XP', { x: 15, y: 160 }, '13px');
    this.scene.add.existing(xpText);
    this.add(xpText)
    this.add(this.xpBar = new Bar(this.scene, { x, y }, this.partyMember.currentExperience, this.partyMember.getExperienceToNextLevel(), 0xD6D252));
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

  public blurPanel() {
    super.blurPanel();
    this.sprite.anims.stop();
  }

  public focusPanel() {
    super.focusPanel();
    this.sprite.anims.setRepeat(-1)
    this.sprite.anims.play(`${this.sprite.texture.key}-walkDown`, false);
  }
}


class Bar extends Phaser.GameObjects.Container {
  private barBack: Phaser.GameObjects.Rectangle;
  private barFill: Phaser.GameObjects.Rectangle;
  private barWidth: number = 90;
  private barBorder: Phaser.GameObjects.RenderTexture;
  constructor(scene: Phaser.Scene, position: Coords, private currentValue: number, private maxValue: number, color: number) {
    super(scene, position.x, position.y);
    this.barBack = new Phaser.GameObjects.Rectangle(scene,
      0,
      0, this.barWidth, 7, 0xbfbfbf, .5);
    this.barFill = new Phaser.GameObjects.Rectangle(scene,
      0,
      0, this.barWidth, 7, color, 1);
    this.barFill.width = 0;
    this.barBorder = scene.add.nineslice(
      0,
      0,
      this.barWidth,
      15,
      "bar",
      5
    );
    this.barBorder.setOrigin(.5, .5)
    scene.add.existing(this)
    scene.add.existing(this.barBack);
    scene.add.existing(this.barFill);
    this.add(this.barBack);
    this.add(this.barFill);
    this.bringToTop(this.barFill);
    this.add(this.barBorder)
    this.bringToTop(this.barBorder);
    this.setBar();
  }
  setCurrentValue(newValue: number) {
    this.currentValue = Math.max(0, newValue);
    this.setBar();
  }
  setBar() {
    const fill = this.barWidth / (this.maxValue / this.currentValue);
    this.scene.tweens.add({
      targets: this.barFill,
      duration: 300,
      width: fill,
    });
  }
}