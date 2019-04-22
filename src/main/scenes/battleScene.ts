import { StateManager } from "../utility/state/StateManager";
import { CombatContainer } from "../components/battle/combat-grid/CombatContainer";
import { UserInterface } from "../components/UI/UserInterface";
import { CombatSprite } from "../components/battle/combat-grid/CombatSprite";
import { CombatResult, CombatActions } from "../components/battle/Battle";
import { Party } from "../components/battle/Party";

export class BattleScene extends Phaser.Scene {
  private partyContainer: CombatContainer;
  private enemyContainer: CombatContainer;
  private UI: UserInterface;
  private previousSceneKey: string;
  private combatManager: CombatManager;

  private pendingPartyMembers: CombatSprite[] = [];
  private setPartyMembers: CombatSprite[] = [];
  private currentFocusedPartyMember: CombatSprite;
  constructor() {
    super('Battle');
  }
  init(data) {
    this.previousSceneKey = data.key;
    this.add.image(0, 0, 'dungeon_battle_background').setOrigin(0, 0).setScale(.5, .5);

    const party = StateManager.getInstance().getCurrentParty();

    this.addAndPopulateContainers(data.enemies, party);

    this.combatManager = new CombatManager(this);

    this.createUI();

    this.events.on('loop-finished', () => {
      //reactivate the UI. Resetart input loop
      console.log("Round over, reset pedning inputs")
    });

    this.pendingPartyMembers = this.partyContainer.getCombatants();
        
    this.currentFocusedPartyMember = this.pendingPartyMembers.shift();

  }
  private addAndPopulateContainers(enemies, party) {
    this.partyContainer = new CombatContainer({ x: 1, y: 3 }, this, party.getParty());
    this.enemyContainer = new CombatContainer({ x: 7, y: 3 }, this, enemies);

    this.add.existing(this.partyContainer);
    this.add.existing(this.enemyContainer);

    this.partyContainer.populateContainer();
    this.enemyContainer.populateContainerRandomly();


  }
  private createUI() {
    this.UI = new UserInterface(this, 'dialog-white');




    const mainPanel = this.UI.createPanel({ x: 3, y: 3 }, { x: 0, y: 6 }, false)
      .addOption('Attack', () => {
        this.UI.showPanel(enemyTargetPanel).focusPanel(enemyTargetPanel);
      })
      .addOption('Defend', () => {
      })
      .addOption('Item', () => {
      })
      .addOption('Run', () => {
        this.endBattle();
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
        this.combatManager.addEvent(new CombatEvent(partyMember, combatSprite, CombatActions.attack));
        if(this.pendingPartyMembers.length){
          this.currentFocusedPartyMember = this.pendingPartyMembers.shift();
        }else{
          this.combatManager.startLoop();
        }
        //Input all of your attacks, then deactivate the UI.
      })
    });


  }
  private endBattle() {
    this.scene.stop();
    this.scene.manager.wake(this.previousSceneKey);
    this.scene.bringToTop(this.previousSceneKey);
  }
}



class CombatEvent {
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

class CombatManager {
  private combatEvents: CombatEvent[] = [];
  constructor(private scene: Phaser.Scene) {

  }
  addEvent(combatEvent) {
    this.combatEvents.push(combatEvent);
  }
  public sortEventsBySpeed() {
    this.combatEvents.sort((a, b) => {
      return a.executor.getCombatant().dexterity - a.target.getCombatant().dexterity;
    });
  }
  public startLoop(){
    this.combatEvents.forEach(combatEvent=>{
      combatEvent.executeAction();

    })
  }
  public nextTurn() {
    if (this.combatEvents.length) {
      const currentEvent = this.combatEvents.unshift();
    } else {
      this.scene.events.emit('loop-finished');
    }

  }

}

