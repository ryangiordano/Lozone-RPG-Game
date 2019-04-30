import { UserInterface } from "../UI/UserInterface";
import { TextFactory } from "../../utility/TextFactory";
import { CombatSprite } from "./combat-grid/CombatSprite";
import { CombatEvent } from "./CombatEvent";
import { Orientation, CombatActions } from "./Battle";
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
    private enemies: Combatant[]) {
    super(scene, spriteKey);
    //TODO: Refactor the combat interface logic here.
  }
  public create(partyMember: Combatant) {
    this.currentPartyMember = partyMember;
    this.createMainPanel();
    this.createStatusPanel();
    this.createEnemyTargetPanel();
  }

  private createMainPanel() {
    this.mainPanel = this.createUIPanel({ x: 3, y: 3 }, { x: 0, y: 6 }, false)
      .addOption('Attack', () => {
        this.showPanel(this.enemyTargetPanel).focusPanel(this.enemyTargetPanel);
      })
      .addOption('Defend', () => {
      })
      .addOption('Item', () => {
      })
      .addOption('Run', () => {
        this.scene.events.emit('end-battle');
      });

    this.setEventOnPanel(this.mainPanel, 'keydown', (event) => {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ESC) {
        //TODO: Handle iterating backward through the combat input loop.
      }
    });

    this.mainPanel.addChildPanel('status', this.statusPanel)
    this.showPanel(this.mainPanel).focusPanel(this.mainPanel);
  }

  private createEnemyTargetPanel() {
    this.enemyTargetPanel = this.createUIPanel(
      { x: 7, y: 3 },
      { x: 3, y: 6 });

    this.enemies.forEach(enemyCombatant => {

      this.enemyTargetPanel.addOption(enemyCombatant.name, () => {
        this.addEvent(new CombatEvent(this.currentPartyMember, enemyCombatant, CombatActions.attack, Orientation.left, this.scene));
        this.confirmSelection();

      });

    });
  }

  private createStatusPanel() {
    this.statusPanel = this.createPresentationPanel({ x: 4, y: 3 }, { x: 3, y: 6 });
    const combatant = this.currentPartyMember;
    const name = this.textFactory.createText(combatant.name, { x: 5, y: 5 }, this.scene);
    const hp = this.textFactory.createText(`HP: ${combatant.currentHp}/${combatant.maxHp}`, { x: 5, y: 15 }, this.scene);
    const mp = this.textFactory.createText(`MP: ${combatant.currentMp}/${combatant.maxMp}`, { x: 5, y: 25 }, this.scene);
    [hp, mp, name].forEach(gameObject => {
      this.scene.add.existing(gameObject);
      this.statusPanel.add(gameObject);
    });
    return this.statusPanel;
  }
  
}
