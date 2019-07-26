import { Combatant } from "./Combatant";
import {
  CombatActionTypes,
  CombatantType,
  Orientation,
  Status
} from "./CombatDataStructures";
import { CombatContainer } from "./combat-grid/CombatContainer";
import { getRandomFloor, Directions } from "../../utility/Utility";
import { PartyMember } from "./PartyMember";
import { CombatEvent } from "./CombatEvent";
import { CombatInterface } from "./CombatInterface";
import { DialogManager } from "../UI/Dialog";

export class Combat {
  private partyContainer: CombatContainer;
  private enemyContainer: CombatContainer;
  private combatUI: CombatInterface;
  private combatEvents: CombatEvent[] = [];
  private partyMembers: Combatant[] = [];
  private enemies: Combatant[] = [];
  private currentPartyFocusIndex: number = 0;

  constructor(
    private scene: Phaser.Scene,
    party: Combatant[],
    enemies: Combatant[]
  ) {
    party.forEach(member => {
      member.setSprite(scene, Directions.right);
      this.partyMembers.push(member);
    });

    enemies.forEach(enemy => {
      enemy.setSprite(scene, Directions.left);
      this.enemies.push(enemy);
    });

    this.addAndPopulateContainers();
    this.displayInputControlsForCurrentPartyMember();

    this.scene.events.on("run-battle", async () => {
      await this.displayMessage(["Escaped Successfully"]);
      this.scene.events.emit("end-battle");
      this.scene.events.off("run-battle");
    });
  }

  private setListenersOnUI() {
    this.combatUI.events.on("option-selected", event => {
      this.addEvent(event);
      this.confirmSelection();
    });
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

    let tempIndex = previous
      ? this.currentPartyFocusIndex - 1
      : this.currentPartyFocusIndex + 1;

    while (previous ? tempIndex > 0 : tempIndex < count) {
      if (this.partyMemberHasImobileStatus(this.partyMembers[tempIndex])) {
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
    return (
      partyMember.status.has(Status.fainted) ||
      partyMember.status.has(Status.confused) ||
      partyMember.status.has(Status.paralyzed)
    );
  }

  private teardownInputUI() {
    this.combatUI.destroyContainer();
  }

  private constructInputUI(partyMember: Combatant) {
    this.combatUI = new CombatInterface(
      this.scene,
      "dialog-white",
      this.partyMembers,
      this.enemies
    );
    this.combatUI.create(partyMember);
    this.setListenersOnUI();
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
        this.sortEventsBySpeed();
        this.startLoop();
        this.resetPartyFocusIndex();
      } else {
        this.displayInputControlsForCurrentPartyMember();
      }
    }, 300);
  }

  private applyEnemyTurns() {
    this.enemies.forEach(enemy => {
      //TODO: In here we would query the enemy's behavior script, and check the state of the battlefield before making a decision for what to do.  For now, we attack;
      const randomPartyMember = this.getRandomAttackablePartyMember();

      this.addEvent(
        new CombatEvent(
          enemy,
          randomPartyMember,
          CombatActionTypes.attack,
          Orientation.right,
          this.scene
        )
      );
    });
  }

  private getRandomAttackablePartyMember() {
    const targetablePartyMembers = this.partyMembers.filter(
      partyMember => !partyMember.status.has(Status.fainted)
    );
    return targetablePartyMembers[
      getRandomFloor(targetablePartyMembers.length)
    ];
  }

  public sortEventsBySpeed() {
    this.combatEvents.sort((a, b) => {
      return a.executor.dexterity - b.executor.dexterity;
    });
  }

  private displayInputControlsForCurrentPartyMember() {
    this.constructInputUI(this.getCurrentPartyMember());
    // Set Listeners after we've created the input ui.  This is
    this.combatUI.initialize();
  }

  private getCurrentPartyMember() {
    const partyMember = this.partyMembers[this.currentPartyFocusIndex];
    return partyMember;
  }

  private async startLoop() {
    if (!this.combatEvents.length && this.enemies.length) {
      // Send control back to user for next round of inputs.
      this.displayInputControlsForCurrentPartyMember();
      return false;
    }
    if (this.enemies.length <= 0) {
      await this.displayMessage(["You've won!"]);
      return this.scene.events.emit("end-battle");
    }

    const combatEvent = this.combatEvents.pop();
    var result = await combatEvent.executeAction();

    // Awaiting until all messags are done being displayed, then we can continue
    await this.displayMessage(result.message);

    const target = result.target;
    this.resolveTargetDeaths(target);
    this.startLoop();
  }

  private async resolveTargetDeaths(target) {
    if (target && target.currentHp === 0) {
      if (target.type === CombatantType.enemy) {
        //Handle battle result object change.
        // destroy sprite.

        const index = this.enemies.findIndex(enemy => enemy.uid === target.uid);
        // Store xp and coins and stuff...
        target.getSprite().destroy();
        if (index > -1) {
          this.enemies.splice(index, 1);
        }
      } else if (target.type === CombatantType.partyMember) {
        target.addStatusCondition(Status.fainted);
        if (
          this.partyMembers.every(partyMember =>
            partyMember.status.has(Status.fainted)
          )    
        ) {
          this.scene.events.emit("game-over");
        }
      }
    }
  }

  /**
   * Function that results after the message scene is done doing its thing.
   * @param message
   */
  displayMessage(message: string[]): Promise<any> {
    const dialogScene = this.scene.scene.get('DialogScene')
    const scenePlugin = new Phaser.Scenes.ScenePlugin(dialogScene);
    return new Promise(resolve => {
      scenePlugin.setActive(false, 'Battle');
      scenePlugin.start("DialogScene", {
        callingSceneKey: 'Battle',
        color: "dialog-white",
        message
      });
      
      scenePlugin.setActive(true, "DialogScene").bringToTop("DialogScene");
      dialogScene.events.once("close-dialog", () => {
        resolve();
      });
    });
  }

  private resetPartyFocusIndex() {
    this.currentPartyFocusIndex = 0;
  }

  public addAndPopulateContainers() {
    this.partyContainer = new CombatContainer(
      { x: 1, y: 3 },
      this.scene,
      this.partyMembers
    );
    this.enemyContainer = new CombatContainer(
      { x: 7, y: 3 },
      this.scene,
      this.enemies
    );

    this.scene.add.existing(this.partyContainer);
    this.scene.add.existing(this.enemyContainer);

    this.partyContainer.populateContainer();
    this.enemyContainer.populateContainerRandomly();
  }

  public handleMessagesClose() {
    throw new Error("Not Yet Implemented");
  }
}
