import { UserInterface, TraversibleObject } from "../../UI/UserInterface";
import { TextFactory } from "../../../utility/TextFactory";
import { CombatEvent, UseItemEvent, SpellCastEvent } from "../CombatEvent";
import {
  Orientation,
  CombatActionTypes,
  CombatEntity,
  Status,
} from "../CombatDataStructures";
import { PartyMember } from "../PartyMember";
import { PanelContainer } from "../../UI/PanelContainer";
import { KeyboardControl } from "../../UI/Keyboard";
import { State } from "../../../utility/state/State";
import { CombatContainer } from "../combat-grid/CombatContainer";
import {
  TargetArea,
  Targeting,
  TargetType,
  SpellType,
} from "../../../data/repositories/SpellRepository";
import { UIPanel } from "../../UI/UIPanel";

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
    private partyCombatContainer: CombatContainer
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

    this.createDetailPanel();
    this.createItemPanel();

    this.createEnemyTraversible();
    this.createPartyTraversible();
  }

  private createMainPanel() {
    const sm = State.getInstance();
    this.mainPanel = this.createUIPanel({ x: 3, y: 3 }, { x: 0, y: 6 }, false)
      .addOption("Attack", () => {
        this.showPanel(this.enemyTraversible).focusPanel(this.enemyTraversible);
        this.handleTraversibleTargeting(
          this.enemyTraversible,
          this.enemyCombatContainer,
          CombatActionTypes.attack,
          {
            targetArea: TargetArea.single,
            targeting: Targeting.enemy,
          }
        );
      })
      .addOption("Defend", () => {
        const event = new CombatEvent(
          this.currentPartyMember,
          [this.currentPartyMember],
          CombatActionTypes.defend,
          Orientation.left,
          this.scene
        );
        this.events.emit("option-selected", event);
      })
      .addOption("Item", () => {
        if (sm.getConsumeablesOnPlayer().length) {
          this.showPanel(this.itemPanel).focusPanel(this.itemPanel);
        } else {
          //TODO: Show a battle toast!
        }
      });

    if (this.currentPartyMember.combatClass.spells.length) {
      this.mainPanel.addOption("Spells", () =>
        this.showPanel(this.spellPanel).focusPanel(this.spellPanel)
      );
    }

    this.mainPanel.addOption("Run", () => {
      this.scene.events.emit("run-battle");
    });

    this.setEventOnPanel(this.mainPanel, "keydown", (event) => {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ESC) {
        //TODO: Handle iterating backward through the combat input loop.
        this.events.emit("move-backward");
      }
    });
  }

  private handleTraversibleTargeting(
    traversible: TraversibleObject,
    combatContainer: CombatContainer,
    combatActionType: CombatActionTypes,
    targetType: TargetType,
    data?
  ) {
    if (data && targetType.targetArea === TargetArea.all) {
      //TODO: Implement attacking all enemies
      combatContainer.targetAll();
      traversible.setTargetAll(true);
      traversible.on("all-chosen", () => {
        traversible.off("all-chosen");
        const targets =
          targetType.targeting === Targeting.enemy
            ? this.enemyCombatContainer.getCombatants()
            : this.partyCombatContainer.getCombatants();
        combatContainer.showCursor(false);
        let event;
        switch (combatActionType) {
          case CombatActionTypes.attack:
            event = this.createCombatEvent(targets);
            break;
          case CombatActionTypes.castSpell:
            event = this.createSpellcastEvent(targets, data);
            break;
          case CombatActionTypes.useItem:
            event = this.createItemEvent(targets, data);
            break;
          default:
            // Don't know what to do? Just punch them.
            event = this.createCombatEvent(targets);
            break;
        }
        this.events.emit("option-selected", event);
        //TODO: This emits the event, however it's skipped over during the turn execution phase.
      });
    } else {
      traversible.on("chosen", (target) => {
        traversible.off("chosen");
        combatContainer.showCursor(false);
        //TODO: Improve this here;
        let event;
        switch (combatActionType) {
          case CombatActionTypes.attack:
            event = this.createCombatEvent([target]);
            break;
          case CombatActionTypes.castSpell:
            event = this.createSpellcastEvent([target], data);
            break;
          case CombatActionTypes.useItem:
            event = this.createItemEvent([target], data);
            break;
          default:
            // Don't know what to do? Just punch them.
            event = this.createCombatEvent([target]);
            break;
        }
        this.events.emit("option-selected", event);
      });

      // Handling Focused.
      const currentFocused = traversible.getFocusedOption();
      combatContainer.setCursor(currentFocused.selectableData.entity.sprite);
      traversible.on("focused", (target) => {
        const sprite = target.entity.sprite;
        combatContainer.setCursor(sprite);
      });
    }

    traversible.on("escape", () => {
      this.traverseBackward();
    });
  }

  private createDetailPanel() {
    this.detailPanel = this.createPresentationPanel(
      { x: 7, y: 3 },
      { x: 3, y: 6 }
    );
  }

  private showDetailPanel(selectedEntity: CombatEntity) {
    this.detailPanel.clearPanelContainerByType("Text");
    this.detailPanel.show();
    const name = this.textFactory.createText(selectedEntity.entity.name, {
      x: 10,
      y: 10,
    });
    this.detailPanel.add(name);
  }

  private createEnemyTraversible() {
    this.enemyTraversible = new TraversibleObject(this.scene, () => {
      this.enemyCombatContainer.showCursor(false);
    });

    this.enemyCombatContainer.getCombatants().forEach((enemyCombatant) => {
      this.enemyTraversible.addOption(
        enemyCombatant,
        () => {
          this.enemyTraversible.emit("chosen", enemyCombatant);
        },
        () => {
          this.enemyTraversible.emit("focused", enemyCombatant);
        }
      );
    });
  }
  private createPartyTraversible() {
    this.partyTraversible = new TraversibleObject(this.scene, () => {
      this.partyCombatContainer.showCursor(false);
    });

    this.partyCombatContainer.getCombatants().forEach((partyMember) => {
      this.partyTraversible.addOption(
        partyMember,
        () => {
          this.partyTraversible.emit("chosen", partyMember);
        },
        () => {
          this.partyTraversible.emit("focused", partyMember);
        }
      );
    });
  }

  /**
   * Create list of items to use in battle.
   * Selecting an item opens the party traversible
   */
  private createItemPanel() {
    this.itemPanel = this.createUIPanel({ x: 7, y: 3 }, { x: 3, y: 6 });
    const sm = State.getInstance();
    const consumeables = sm.getConsumeablesOnPlayer();
    consumeables
      .filter((item) => item.canSetIntendToUse())
      .forEach((item) => {
        this.itemPanel.addOption(`${item.name} x${item.getQuantity()}`, () => {
          this.itemPanel.close();
          item.setIntendToUse();
          this.showPanel(this.partyTraversible).focusPanel(
            this.partyTraversible
          );
          this.handleTraversibleTargeting(
            this.partyTraversible,
            this.partyCombatContainer,
            CombatActionTypes.useItem,
            item.effect.targetType,
            item
          );
        });
      });
  }

  private createPartyTargetPanel() {
    this.partyTargetPanel = this.createUIPanel({ x: 7, y: 3 }, { x: 3, y: 6 });

    this.partyCombatContainer.getCombatants().forEach((partyMember) => {
      this.partyTargetPanel.addOption(partyMember.entity.name, () => {
        this.partyTargetPanel.emit("party-member-chosen", partyMember);
      });
    });
  }

  private createStatusPanel() {
    this.statusPanel = this.createPresentationPanel(
      { x: 5, y: 3 },
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
    [hp, mp, name].forEach((gameObject) => {
      this.scene.add.existing(gameObject);
      this.statusPanel.add(gameObject);
    });

    return this.statusPanel;
  }

  private createSpellPanel() {
    this.spellPanel = this.createUIPanel({ x: 7, y: 3 }, { x: 3, y: 6 });
    const combatant = this.currentPartyMember;
    combatant.combatClass.spells.forEach(
      (classSpell) =>
        classSpell.requiredLevel <= combatant.level &&
        this.spellPanel.addOption(classSpell.spell.name, () => {
          this.spellPanel.close();

          if (classSpell.spell.targetType.targeting === Targeting.ally) {
            this.showPanel(this.partyTraversible).focusPanel(
              this.partyTraversible
            );
            this.handleTraversibleTargeting(
              this.partyTraversible,
              this.partyCombatContainer,
              CombatActionTypes.castSpell,
              classSpell.spell.targetType,
              classSpell
            );
          } else {
            this.showPanel(this.enemyTraversible).focusPanel(
              this.enemyTraversible
            );
            this.handleTraversibleTargeting(
              this.enemyTraversible,
              this.enemyCombatContainer,
              CombatActionTypes.castSpell,
              classSpell.spell.targetType,
              classSpell
            );
          }
        })
    );
    return this.spellPanel;
  }

  createCombatEvent(targets) {
    const event = new CombatEvent(
      this.currentPartyMember,
      targets.map((t) => t.entity),
      CombatActionTypes.attack,
      Orientation.left,
      this.scene
    );
    return event;
  }

  createSpellcastEvent(targets, classSpell) {
    const event = new SpellCastEvent(
      this.currentPartyMember,
      targets.map((t) => t.entity),
      CombatActionTypes.castSpell,
      Orientation.left,
      this.scene,
      classSpell.spell
    );
    return event;
  }

  createItemEvent(targets, item) {
    const event = new UseItemEvent(
      this.currentPartyMember,
      targets.map((t) => t.entity),
      CombatActionTypes.useItem,
      Orientation.left,
      this.scene,
      item
    );
    return event;
  }
}
