import { Combatant } from "./Combatant";
import { CombatSprite } from "./combat-grid/CombatSprite";
import { CombatActions, CombatResult } from "./Battle";
import { CombatContainer } from "./combat-grid/CombatContainer";
import { UserInterface } from "../UI/UserInterface";
export class CombatManager {
  private partyContainer: CombatContainer;
  private enemyContainer: CombatContainer;
  private UI: UserInterface;
  private combatEvents: CombatEvent[] = [];
  private pendingPartyMembers: CombatSprite[] = [];
  private setPartyMembers: CombatSprite[] = [];
  private currentFocusedPartyMember: CombatSprite;
  constructor(private scene: Phaser.Scene, party: Combatant[], enemies) {
  }
  createUI() {
    this.UI = new UserInterface(this.scene, 'dialog-white');

    const mainPanel = this.UI.createPanel({ x: 3, y: 3 }, { x: 0, y: 6 }, false)
      .addOption('Attack', () => {
        this.UI.showPanel(enemyTargetPanel).focusPanel(enemyTargetPanel);
      })
      .addOption('Defend', () => {
      })
      .addOption('Item', () => {
      })
      .addOption('Run', () => {
        this.scene.events.emit('end-battle');
      });
    this.UI.showPanel(mainPanel).focusPanel(mainPanel);

    // ATTACK ENEMIES
    const enemyTargetPanel = this.UI.createPanel(
      { x: 7, y: 3 },
      { x: 3, y: 6 });

    this.enemyContainer.getCombatants().forEach(combatSprite => {

      enemyTargetPanel.addOption(combatSprite.getCombatant().name, () => {
        const partyMember = this.currentFocusedPartyMember;
        this.setPartyMembers.push(partyMember);
        this.addEvent(new CombatEvent(partyMember, combatSprite, CombatActions.attack));
        if (this.pendingPartyMembers.length) {
          this.currentFocusedPartyMember = this.pendingPartyMembers.shift();
        } else {
          this.startLoop();
          this.resetParty();
        }
        this.UI.closePanel(enemyTargetPanel);
        //Input all of your attacks, then deactivate the UI.
      })
    });


  }
  public sortEventsBySpeed() {
    this.combatEvents.sort((a, b) => {
      return a.executor.getCombatant().dexterity - a.target.getCombatant().dexterity;
    });
  }
  public startLoop() {
    this.combatEvents.forEach(combatEvent => {
      combatEvent.executeAction();
    });
    this.combatEvents = [];
  }
  public nextTurn() {
    if (this.combatEvents.length) {
      const currentEvent = this.combatEvents.unshift();
    }
    else {
      this.scene.events.emit('loop-finished');
    }
  }

  addEvent(combatEvent) {
    this.combatEvents.push(combatEvent);
  }
  resetParty() {
    this.pendingPartyMembers = [...this.partyContainer.getCombatants()];
    this.setPartyMembers = [];
    this.currentFocusedPartyMember = this.pendingPartyMembers.shift();
  }
  addAndPopulateContainers(enemies, party) {
    debugger;
    this.partyContainer = new CombatContainer({ x: 1, y: 3 }, this.scene, party);
    this.enemyContainer = new CombatContainer({ x: 7, y: 3 }, this.scene, enemies);

    this.scene.add.existing(this.partyContainer);
    this.scene.add.existing(this.enemyContainer);

    this.partyContainer.populateContainer();
    this.enemyContainer.populateContainerRandomly();


  }
}


export class CombatEvent {
  constructor
    (public executor: CombatSprite,
      public target: CombatSprite,
      public action: CombatActions) {

  }
  executeAction() {
    //For now, just let them attack.
    const target = this.target.getCombatant();
    const executor = this.executor.getCombatant();
    const results: CombatResult = executor.attackTarget(target);
    console.log(`${executor.name} attacks ${target.name} for ${results.resultingValue}`)


    //TODO: broadcast actions to an in battle dialog 
  }

}