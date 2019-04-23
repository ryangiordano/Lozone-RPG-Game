import { Combatant } from "./Combatant";
import { CombatSprite } from "./combat-grid/CombatSprite";
import { CombatActions, CombatResult } from "./Battle";
import { CombatContainer } from "./combat-grid/CombatContainer";
import { UserInterface } from "../UI/UserInterface";
import { CombatMenuScene } from "../../scenes/CombatMenuScene";
export class CombatManager {
  private partyContainer: CombatContainer;
  private enemyContainer: CombatContainer;
  private UI: UserInterface;
  private combatEvents: CombatEvent[] = [];
  private partyMembers: CombatSprite[] = [];
  private enemies: CombatSprite[] = [];
  private currentPartyFocusIndex: number = 0;
  private combatMenuScenes: CombatMenuScene[];
  constructor(private scene: Phaser.Scene, party: Combatant[], enemies: Combatant[]) {
    party.forEach(member => this.partyMembers.push(this.combatantToCombatSprite(member)));
    enemies.forEach(enemy => this.enemies.push(this.combatantToCombatSprite(enemy)));
  }
  focusPartyInput(index: number) {
    this.currentPartyFocusIndex = index;
  }
  focusNextPartyInput(): boolean {
    // move to the next party member to get their input.
    const count = this.partyMembers.length - 1;
    if (this.currentPartyFocusIndex < count) {
      this.currentPartyFocusIndex += 1;
      return true;
    }
    return false;
  }
  private combatantToCombatSprite(combatant: Combatant) {
    return new CombatSprite(this.scene, 0, 0, combatant);
  }
  focusPreviousPartyInput() {
    //move to the previous party member and pop their event out of the event array.
    if (this.currentPartyFocusIndex <= 0) {
      this.currentPartyFocusIndex -= 1;
      this.combatEvents.pop();
      return true;
    }
    return false;
  }
  teardownInputUI() {
    this.UI.destroyContainer();
  }
  constructInputUI() {
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

        const partyMember = this.partyMembers[this.currentPartyFocusIndex];
        this.addEvent(new CombatEvent(partyMember, combatSprite, CombatActions.attack));

        const hasNextInput = this.focusNextPartyInput();
        this.teardownInputUI();




        if (!hasNextInput) {
          this.startLoop();
          this.resetPartyFocusIndex();
        } else {
          setTimeout(() => {
            this.constructInputUI();
          }, 500)
        }
      });

    });
  }
  private finalizeSelection() {

  }
  private setAttackEvent() {

  }
  public sortEventsBySpeed() {
    this.combatEvents.sort((a, b) => {
      return a.executor.getCombatant().dexterity - a.target.getCombatant().dexterity;
    });
  }
  public startLoop() {
    if (!this.combatEvents.length) {
      // Send control back to user for next round of inputs.
      this.constructInputUI();
      return false;
    }
    const combatEvent = this.combatEvents.pop();
    combatEvent.executeAction().then((result) => {
      this.startLoop();
    });
  }

  addEvent(combatEvent) {
    this.combatEvents.push(combatEvent);
  }
  resetPartyFocusIndex() {
    this.currentPartyFocusIndex = 0;
  }
  addAndPopulateContainers() {
    this.partyContainer = new CombatContainer({ x: 1, y: 3 }, this.scene, this.partyMembers);
    this.enemyContainer = new CombatContainer({ x: 7, y: 3 }, this.scene, this.enemies);

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
  executeAction(): Promise<CombatResult> {
    return new Promise((resolve) => {
      const target = this.target.getCombatant();
      const executor = this.executor.getCombatant();

      // Needs to be replaced with animations/tweening and callbacks, but it works asynchronously.
      this.executor.setX(this.executor.x + 15);
      setTimeout(() => {
        this.executor.setX(this.executor.x - 15);
        setTimeout(() => {
          this.target.setAlpha(.5);
          setTimeout(() => {
            this.target.setAlpha(1);
            const results: CombatResult = executor.attackTarget(target);
            console.log(`${executor.name} attacks ${target.name} for ${results.resultingValue}`);
            console.log(`${target.name} has ${target.currentHp} HP out of ${target.hp} left.`);

            return resolve(results);
          }, 100)
        }, 500)
      }, 100)
    })
    //For now, just let them attack.


    // We want to be able to show executor attacking.  Then when that is done, show target taking damage.
    // Then return results.



    //TODO: broadcast actions to an in battle dialog 
  }

}