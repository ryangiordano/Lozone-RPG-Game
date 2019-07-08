import { UserInterface } from "../UI/UserInterface";
import { TextFactory } from "../../utility/TextFactory";
import { CombatEvent } from "./CombatEvent";
import { Orientation, CombatActionTypes } from "./CombatDataStructures";
import { PartyMember } from "./PartyMember";
import { Combatant } from "./Combatant";
import { UIPanel, PanelContainer } from "../UI/PanelContainer";

export class CombatInterface extends UserInterface {
  private textFactory: TextFactory = new TextFactory();
  private enemyTargetPanel: UIPanel;
  private statusPanel: PanelContainer;
  private mainPanel: UIPanel;
  private currentPartyMember: Combatant;

  constructor(
    scene: Phaser.Scene,
    spriteKey: string,
    private party: PartyMember[],
    private enemies: Combatant[]
  ) {
    super(scene, spriteKey);
    //TODO: Refactor the combat interface logic here.
  }
  public create(partyMember: Combatant) {
    this.currentPartyMember = partyMember;
    this.createMainPanel();
    this.createStatusPanel();

    this.mainPanel.addChildPanel("status", this.statusPanel);
    this.showPanel(this.mainPanel).focusPanel(this.mainPanel);

    this.createEnemyTargetPanel();
  }

  private createMainPanel() {
    this.mainPanel = this.createUIPanel({ x: 3, y: 3 }, { x: 0, y: 6 }, false)
      .addOption("Attack", () => {
        this.showPanel(this.enemyTargetPanel).focusPanel(this.enemyTargetPanel);
      })
      .addOption("Defend", () => {
        const event = new CombatEvent(
          this.currentPartyMember,
          null,
          CombatActionTypes.defend,
          Orientation.left,
          this.scene
        );
        this.events.emit("option-selected", event);
      })
      .addOption("Item", () => {})
      .addOption("Run", () => {
        this.scene.events.emit("end-battle");
      });

    this.setEventOnPanel(this.mainPanel, "keydown", event => {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ESC) {
        //TODO: Handle iterating backward through the combat input loop.
      }
    });
  }

  private createEnemyTargetPanel() {
    this.enemyTargetPanel = this.createUIPanel({ x: 7, y: 3 }, { x: 3, y: 6 });

    this.enemies.forEach(enemyCombatant => {
      this.enemyTargetPanel.addOption(enemyCombatant.name, () => {
        const event = new CombatEvent(
          this.currentPartyMember,
          enemyCombatant,
          CombatActionTypes.attack,
          Orientation.left,
          this.scene
        );
        this.events.emit("option-selected", event);
      });
    });
  }

  private createStatusPanel() {
    this.statusPanel = this.createPresentationPanel(
      { x: 4, y: 3 },
      { x: 3, y: 6 }
    );
    const combatant = this.currentPartyMember;
    const statusTextSize = "32px";
    const name = this.textFactory.createText(
      combatant.name,
      { x: 20, y: 10 },
      this.scene,
      statusTextSize
    );
    const hp = this.textFactory.createText(
      `HP: ${combatant.currentHp}/${combatant.maxHp}`,
      { x: 20, y: 50 },
      this.scene,
      statusTextSize
    );
    const mp = this.textFactory.createText(
      `MP: ${combatant.currentMp}/${combatant.maxMp}`,
      { x: 20, y: 90 },
      this.scene,
      statusTextSize
    );
    [hp, mp, name].forEach(gameObject => {
      this.scene.add.existing(gameObject);
      this.statusPanel.add(gameObject);
    });

    return this.statusPanel;
  }
}
