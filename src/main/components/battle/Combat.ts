import { Combatant } from "./Combatant";
import { CombatSprite } from "./combat-grid/CombatSprite";
import { CombatActions, CombatantType, Orientation, Status } from "./Battle";
import { CombatContainer } from "./combat-grid/CombatContainer";
import { UserInterface } from "../UI/UserInterface";
import { TextFactory } from "../../utility/TextFactory";
import { getRandomFloor, Directions } from "../../utility/Utility";
import { PartyMember } from "./PartyMember";
import { CombatEvent } from "./CombatEvent";

export class Combat {
  private partyContainer: CombatContainer;
  private enemyContainer: CombatContainer;
  private UI: UserInterface;
  private combatEvents: CombatEvent[] = [];
  private partyMembers: CombatSprite[] = [];
  private enemies: CombatSprite[] = [];
  private currentPartyFocusIndex: number = 0;
  private textFactory: TextFactory = new TextFactory();
  constructor(private scene: Phaser.Scene, party: Combatant[], enemies: Combatant[]) {
    party.forEach(member => this.partyMembers.push(this.combatantToCombatSprite(member)));

    enemies.forEach(enemy => this.enemies.push(this.combatantToCombatSprite(enemy)));

    this.addAndPopulateContainers();
    this.displayInputControlsForCurrentPartyMember();
  }

  private combatantToCombatSprite(combatant: Combatant) {
    return new CombatSprite(this.scene, 0, 0, combatant);
  }

  public focusPreviousPartyInput(): boolean {
    return this.focusPartyInput(Directions.left);
  }

  public focusNextPartyInput(): boolean {
    return this.focusPartyInput(Directions.right);
  }

  private focusPartyInput(direction: Directions): boolean {
    const count = this.partyMembers.length;
    const previous = direction === Directions.left;

    let tempIndex = previous ? this.currentPartyFocusIndex - 1 : this.currentPartyFocusIndex + 1;

    while (previous ? tempIndex > 0 : tempIndex < count) {
      if (this.partyMemberHasImobileStatus(this.partyMembers[tempIndex].getCombatant())) {
        previous ? tempIndex-- : tempIndex++;
      } else {
        this.currentPartyFocusIndex = tempIndex;
        previous ? this.combatEvents.pop() : null;
        return true;
      }
      return false;
    }
  }

  private partyMemberHasImobileStatus(partyMember: PartyMember) {
    return (partyMember.status.has(Status.fainted) ||
      partyMember.status.has(Status.confused) ||
      partyMember.status.has(Status.paralyzed));
  }

  private teardownInputUI() {
    this.UI.destroyContainer();
  }

  private constructInputUI(partyMember) {
    this.UI = new UserInterface(this.scene, 'dialog-white');

    const mainPanel = this.UI.createUIPanel({ x: 3, y: 3 }, { x: 0, y: 6 }, false)
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
    const mainStatusPanel = this.createStatusPanel(partyMember);

    mainPanel.addChildPanel('status', mainStatusPanel)
    this.UI.showPanel(mainPanel).focusPanel(mainPanel);

    // ATTACK ENEMIES
    const enemyTargetPanel = this.UI.createUIPanel(
      { x: 7, y: 3 },
      { x: 3, y: 6 });

    this.enemyContainer.getCombatants().forEach(combatSprite => {

      enemyTargetPanel.addOption(combatSprite.getCombatant().name, () => {
        this.addEvent(new CombatEvent(partyMember, combatSprite, CombatActions.attack, Orientation.left, this.partyMembers, this.enemies, this.scene));
        this.confirmSelection();
      });

    });
  }

  private createStatusPanel(partyMember: CombatSprite) {
    const statusPanel = this.UI.createPresentationPanel({ x: 4, y: 3 }, { x: 3, y: 6 });
    const combatant = partyMember.getCombatant();
    const name = this.textFactory.createText(combatant.name, { x: 5, y: 5 }, this.scene);
    const hp = this.textFactory.createText(`HP: ${combatant.currentHp}/${combatant.hp}`, { x: 5, y: 15 }, this.scene);
    const mp = this.textFactory.createText(`MP: ${combatant.currentMp}/${combatant.mp}`, { x: 5, y: 25 }, this.scene);
    [hp, mp, name].forEach(gameObject => {
      this.scene.add.existing(gameObject);
      statusPanel.add(gameObject);
    });
    return statusPanel;
  }

  private addEvent(combatEvent) {
    this.combatEvents.push(combatEvent);
  }

  private confirmSelection() {
    const hasNextInput = this.focusNextPartyInput();
    this.teardownInputUI();
    setTimeout(() => {
      if (!hasNextInput) {
        this.applyEnemyTurns();
        this.sortEventsBySpeed()
        this.startLoop();
        this.resetPartyFocusIndex();
      } else {
        this.constructInputUI(this.getCurrentPartyMember());
      }
    }, 300)
  }

  private applyEnemyTurns() {
    this.enemies.forEach(enemy => {
      //TODO: In here we would query the enemy's behavior script, and check the state of the battlefield before making a decision for what to do.  For now, we attack;
      const randomPartyMember = this.getRandomAttackablePartyMember();

      this.addEvent(new CombatEvent(enemy, randomPartyMember, CombatActions.attack, Orientation.right, this.enemies, this.partyMembers, this.scene));
    })
  }

  private getRandomAttackablePartyMember() {
    const targetablePartyMembers = this.partyMembers.filter(partyMember => !partyMember.getCombatant().status.has(Status.fainted));
    return targetablePartyMembers[getRandomFloor(targetablePartyMembers.length)];
  }

  public sortEventsBySpeed() {
    this.combatEvents.sort((a, b) => {
      return a.executorCombatSprite.getCombatant().dexterity - a.targetCombatSprite.getCombatant().dexterity;
    });
  }

  private displayInputControlsForCurrentPartyMember() {
    this.constructInputUI(this.getCurrentPartyMember());
  }

  private getCurrentPartyMember() {
    const partyMember = this.partyMembers[this.currentPartyFocusIndex];
    return partyMember;
  }

  private startLoop() {
    if (!this.combatEvents.length) {
      // Send control back to user for next round of inputs.
      this.displayInputControlsForCurrentPartyMember()
      return false;
    }
    const combatEvent = this.combatEvents.pop();
    combatEvent.executeAction().then((result) => {
      const target = <Combatant>result.targetCombatSprite.getCombatant();
      if (target.currentHp === 0) {
        if (target.type === CombatantType.enemy) {
          //Handle battle result object change.
          // destroy sprite.

          const index = this.enemies.findIndex(enemy => enemy.uid === result.targetCombatSprite.uid);
          result.targetCombatSprite.destroy();
          if (index > -1) {
            this.enemies.splice(index, 1);
            if (this.enemies.length <= 0) {
              this.scene.events.emit('end-battle');
              //TODO: Battle over, distribute Points and treasure
            }
          }

        } else if (target.type === CombatantType.partyMember) {
          target.addStatusCondition(Status.fainted);
          if (this.partyMembers.every(partyMember => partyMember.getCombatant().status.has(Status.fainted))) {
            this.scene.events.emit('game-over');
          }
        }
      }
      this.startLoop();
    });
  }

  private resetPartyFocusIndex() {
    this.currentPartyFocusIndex = 0;
  }

  public addAndPopulateContainers() {
    this.partyContainer = new CombatContainer({ x: 1, y: 3 }, this.scene, this.partyMembers);
    this.enemyContainer = new CombatContainer({ x: 7, y: 3 }, this.scene, this.enemies);

    this.scene.add.existing(this.partyContainer);
    this.scene.add.existing(this.enemyContainer);

    this.partyContainer.populateContainer();
    this.enemyContainer.populateContainerRandomly();
  }
}


