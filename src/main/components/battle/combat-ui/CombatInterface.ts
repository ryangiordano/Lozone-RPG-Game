import { UserInterface, TraversibleObject } from "../../UI/UserInterface";
import { TextFactory } from "../../../utility/TextFactory";
import { CombatEvent, UseItemEvent, SpellCastEvent } from '../CombatEvent';
import { Orientation, CombatActionTypes, CombatEntity } from '../CombatDataStructures';
import { PartyMember } from "../PartyMember";
import { Combatant } from "../Combatant";
import { UIPanel, PanelContainer } from "../../UI/PanelContainer";
import { KeyboardControl } from "../../UI/Keyboard";
import { State } from "../../../utility/state/State";
import { SpellType } from "../../../data/repositories/SpellRepository";
import { CombatContainer } from "../combat-grid/CombatContainer";

export class CombatInterface extends UserInterface {
  private textFactory: TextFactory;
  private enemyTargetPanel: UIPanel;
  private partyTargetPanel: UIPanel;
  private itemPanel: UIPanel;
  private statusPanel: PanelContainer;
  private spellPanel: UIPanel;
  private mainPanel: UIPanel;
  private detailPanel: PanelContainer;
  private currentPartyMember: PartyMember;

  private enemyTraversible: TraversibleObject;
  private partyTraversible: TraversibleObject;

  constructor(
    scene: Phaser.Scene,
    spriteKey: string,
    private enemyCombatContainer: CombatContainer,
    private partyCombatContainer: CombatContainer,
  ) {
    super(scene, spriteKey, new KeyboardControl(scene));
    this.textFactory = new TextFactory(scene);
  }
  public create(partyMember: PartyMember) {
    this.currentPartyMember = partyMember;
    this.createMainPanel();
    this.createStatusPanel();
    this.createSpellPanel();

    this.mainPanel.addChildPanel("status", this.statusPanel);
    this.showPanel(this.mainPanel).focusPanel(this.mainPanel);

    this.createEnemyTargetPanel();
    this.createPartyTargetPanel();
    this.createDetailPanel();
    this.createItemPanel();

    this.createEnemyTraversible();
    this.createPartyTraversible();
  }

  private createMainPanel() {
    this.mainPanel = this.createUIPanel({ x: 3, y: 3 }, { x: 0, y: 6 }, false)
      .addOption("Attack", () => {

        this.showPanel(this.enemyTraversible).focusPanel(this.enemyTraversible);

        const currentFocused = this.enemyTraversible.getFocusedOption();
        this.enemyCombatContainer.setCursor(currentFocused.selectableData.entity.sprite)
        this.enemyTraversible.on('enemy-focused', (enemy) => {
          const sprite = enemy.entity.sprite;
          this.enemyCombatContainer.setCursor(sprite);
        });

        this.enemyTraversible.on('enemy-chosen', (enemy) => {
          this.enemyTraversible.off('enemy-chosen');
          this.enemyCombatContainer.showCursor(false);
          const event = new CombatEvent(
            this.currentPartyMember,
            enemy.entity,
            CombatActionTypes.attack,
            Orientation.left,
            this.scene
          );
          this.events.emit("option-selected", event);
        });

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
      .addOption("Item", () => this.showPanel(this.itemPanel).focusPanel(this.itemPanel))

    if (this.currentPartyMember.combatClass.spells.length) {
      this.mainPanel.addOption("Spells", () => this.showPanel(this.spellPanel).focusPanel(this.spellPanel))
    }

    //TODO: Scrollable panels;
    this.mainPanel.addOption("Run", () => {
      this.scene.events.emit("run-battle");
    });

    this.setEventOnPanel(this.mainPanel, "keydown", event => {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ESC) {
        //TODO: Handle iterating backward through the combat input loop.
        this.events.emit("move-backward")
      }
    });
  }

  private createDetailPanel() {
    this.detailPanel = this.createPresentationPanel({ x: 7, y: 3 }, { x: 3, y: 6 });
  }

  private showDetailPanel(selectedEntity: CombatEntity) {
    this.detailPanel.clearPanelContainerByType('Text');
    this.detailPanel.show();
    const name = this.textFactory.createText(selectedEntity.entity.name, { x: 10, y: 10 });
    this.detailPanel.add(name)
  }

  private createEnemyTargetPanel() {
    this.enemyTargetPanel = this.createUIPanel({ x: 7, y: 3 }, { x: 3, y: 6 });

    this.enemyCombatContainer.getCombatants().forEach(enemyCombatant => {
      this.enemyTargetPanel.addOption(enemyCombatant.entity.name, () => {
        this.enemyTargetPanel.emit("enemy-chosen", enemyCombatant);
      });
    });
  }

  private createEnemyTraversible() {
    this.enemyTraversible = new TraversibleObject(this.scene, ()=>{
      this.enemyCombatContainer.showCursor(false);
    });

    this.enemyCombatContainer.getCombatants().forEach(enemyCombatant => {

      this.enemyTraversible.addOption(enemyCombatant, () => {
        this.enemyTraversible.emit("enemy-chosen", enemyCombatant);
      }, () => {
        this.enemyTraversible.emit("enemy-focused", enemyCombatant);
      });

    });
  }
  private createPartyTraversible() {
    this.partyTraversible = new TraversibleObject(this.scene)

  }

  private createItemPanel() {
    this.itemPanel = this.createUIPanel({ x: 7, y: 3 }, { x: 3, y: 6 });
    const sm = State.getInstance();
    const consumeables = sm.getConsumeablesOnPlayer();
    consumeables.forEach(item => {
      // Create list of items to use in battle.
      this.itemPanel.addOption(`${item.name} x${item.quantity}`, () => {
        // On item use, show party member panel
        this.itemPanel.close();
        this.showPanel(this.partyTargetPanel).focusPanel(this.partyTargetPanel);
        this.partyTargetPanel.on('party-member-chosen', (partyMember) => {
          this.partyTargetPanel.off("party-member-chosen");
          const event = new UseItemEvent(
            this.currentPartyMember,
            partyMember.entity,
            CombatActionTypes.useItem,
            Orientation.left,
            this.scene,
            item,
          );
          this.events.emit('option-selected', event);
        })
      })
    })

  }

  private createPartyTargetPanel() {
    this.partyTargetPanel = this.createUIPanel({ x: 7, y: 3 }, { x: 3, y: 6 });

    this.partyCombatContainer.getCombatants().forEach(partyMember => {
      this.partyTargetPanel.addOption(partyMember.entity.name, () => {
        this.partyTargetPanel.emit("party-member-chosen", partyMember);
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
      statusTextSize
    );
    const hp = this.textFactory.createText(
      `HP: ${combatant.currentHp}/${combatant.getMaxHp()}`,
      { x: 20, y: 50 },
      statusTextSize
    );
    const mp = this.textFactory.createText(
      `MP: ${combatant.currentMp}/${combatant.getMaxMp()}`,
      { x: 20, y: 90 },
      statusTextSize
    );
    [hp, mp, name].forEach(gameObject => {
      this.scene.add.existing(gameObject);
      this.statusPanel.add(gameObject);
    });

    return this.statusPanel;
  }

  private createSpellPanel() {
    this.spellPanel = this.createUIPanel(
      { x: 7, y: 3 },
      { x: 3, y: 6 }
    );
    const combatant = this.currentPartyMember;
    combatant.combatClass.spells.forEach(classSpell =>
      classSpell.requiredLevel <= combatant.level &&
      this.spellPanel.addOption(classSpell.spell.name, () => {
        this.spellPanel.close();

        // Show 
        if (classSpell.spell.type === SpellType.attack) {
          this.showPanel(this.enemyTargetPanel).focusPanel(this.enemyTargetPanel);
          this.enemyTargetPanel.on('enemy-chosen', (enemy) => {
            this.enemyTargetPanel.off("enemy-chosen");
            const event = this.createEvent(enemy, classSpell)
            this.events.emit('option-selected', event);
          });
        }

        if (classSpell.spell.type === SpellType.restoration) {
          this.showPanel(this.partyTargetPanel).focusPanel(this.partyTargetPanel);
          this.partyTargetPanel.on('party-member-chosen', (partyMember) => {
            this.partyTargetPanel.off("party-member-chosen");
            const event = this.createEvent(partyMember, classSpell)
            this.events.emit('option-selected', event);
          })
        }

      }));
    return this.spellPanel;
  }
  createEvent(target, classSpell) {
    const event = new SpellCastEvent(
      this.currentPartyMember,
      target.entity,
      CombatActionTypes.castSpell,
      Orientation.left,
      this.scene,
      classSpell.spell,
    );
    return event;
  }
}
