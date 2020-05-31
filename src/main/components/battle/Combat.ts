import {
  scaleUpDown,
  slowScaleUp,
  textScaleUp,
} from "./../../utility/tweens/text";
import { Combatant } from "./Combatant";
import {
  CombatActionTypes,
  CombatantType,
  Orientation,
  Status,
  LootCrate,
} from "./CombatDataStructures";
import { CombatContainer } from "./combat-grid/CombatContainer";
import { getRandomFloor, Directions, wait } from "../../utility/Utility";
import { PartyMember } from "./PartyMember";
import { CombatEvent } from "./CombatEvent";
import { CombatInterface } from "./combat-ui/CombatInterface";
import { State } from "../../utility/state/State";
import { Enemy } from "./Enemy";
import { CombatEntity, CombatAction } from "./CombatDataStructures";
import { EffectsRepository } from "../../data/repositories/EffectRepository";
import { TextFactory } from "../../utility/TextFactory";
import { fainted } from "../../utility/AnimationEffects/fainted";
import { AudioScene } from "../../scenes/audioScene";

export interface BattleState {
  flagsToFlip: number[];
  victorious: boolean;
}
export class Combat {
  private partyContainer: CombatContainer;
  private lootCrate: LootCrate;
  private enemyContainer: CombatContainer;
  private combatUI: CombatInterface;
  private combatEvents: CombatEvent[] = [];
  private partyMembers: CombatEntity[] = [];
  private enemies: CombatEntity[] = [];
  private currentPartyFocusIndex: number = -1;
  private state = State.getInstance();
  private victoryFlags: number[] = [];
  private effectsRepository: EffectsRepository;

  constructor(
    private scene: Phaser.Scene,
    party: CombatEntity[],
    enemies: CombatEntity[]
  ) {
    party.forEach((member) => {
      member.entity.setSprite(scene, Directions.right);
      this.partyMembers.push(member);
      this.applyStatus(this.partyMembers);
    });

    this.lootCrate = {
      itemIds: [],
      coin: 0,
      experiencePoints: 0,
    };

    enemies.forEach((enemy) => {
      enemy.entity.setSprite(scene, Directions.left);
      this.enemies.push(enemy);
      const enemyEntity = <Enemy>enemy.entity;
      if (enemyEntity.flagsWhenDefeated) {
        this.victoryFlags = [
          ...this.victoryFlags,
          ...enemyEntity.flagsWhenDefeated,
        ];
      }
    });

    this.addAndPopulateContainers();
    setTimeout(() => {
      this.displayInputControlsForCurrentPartyMember();
    }, 1000);

    this.scene.events.on("run-battle", async () => {
      await this.displayMessage(["Escaped Successfully"]);
      this.scene.events.emit("end-battle", {
        victorious: false,
        flagsToFlip: null,
      });
    });

    this.effectsRepository = new EffectsRepository(this.scene.game);
  }

  private applyStatus(partyMembers) {
    partyMembers.forEach((p) => {
      const fainted = p.entity.status.has(Status.fainted);
      if (fainted) {
        p.entity.handleFaint();
      }
    });
  }

  private setListenersOnUI() {
    this.combatUI.events.on("option-selected", (event) => {
      this.addEvent(event);
      this.confirmSelection();
    });
    this.combatUI.events.on("character-incapacitated", () => {
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
      const partyMember = <PartyMember>this.partyMembers[tempIndex].entity;
      if (this.partyMemberHasImobileStatus(partyMember)) {
        previous ? tempIndex-- : tempIndex++;
      } else {
        this.currentPartyFocusIndex = tempIndex;
        previous ? this.combatEvents.pop() : null;
        return true;
      }
      //TODO: If we have no party members, the battle should end...
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

  private constructInputUI(partyMember: PartyMember) {
    this.combatUI = new CombatInterface(
      this.scene,
      "dialog-white",
      this.enemyContainer,
      this.partyContainer
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
    this.enemies.forEach((enemy) => {
      //TODO: In here we would query the enemy's behavior script, and check the state of the battlefield before making a decision for what to do.  For now, we attack;
      const randomPartyMember = this.getRandomAttackablePartyMember();

      this.addEvent(
        new CombatEvent(
          enemy.entity,
          [randomPartyMember.entity],
          CombatActionTypes.attack,
          Orientation.right,
          this.scene
        )
      );
    });
  }

  private getRandomAttackablePartyMember() {
    const targetablePartyMembers = this.partyMembers.filter(
      (partyMember) => !partyMember.entity.status.has(Status.fainted)
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
    // if this is the first selection.
    if (this.currentPartyFocusIndex < 0) {
      this.focusNextPartyInput();
    }
    const partyMemberEntity =
      this.getCurrentPartyMember() &&
      <PartyMember>this.getCurrentPartyMember().entity;
    partyMemberEntity && this.constructInputUI(partyMemberEntity);
    this.combatUI.initialize();
  }

  private getCurrentPartyMember() {
    const partyMember = this.partyMembers[this.currentPartyFocusIndex];
    return partyMember;
  }

  /**
   * Resolve target actions.
   */
  private async startLoop() {
    if (!this.combatEvents.length && this.enemies.length) {
      // Send control back to user for next round of inputs.
      this.displayInputControlsForCurrentPartyMember();
      return false;
    }
    if (this.enemies.length <= 0) {
      return this.handleBattleEnd();
    }

    const combatEvent = this.combatEvents.pop();
    let results = await combatEvent.executeAction();
    this.updateCombatGrids();

    // Handle failures
    const failures = results.filter(
      (r) => r.actionType === CombatActionTypes.failure
    );
    if (failures.length > 0) {
      await Promise.all(failures.map((f) => this.displayMessage(f.message)));
    }

    if (combatEvent.type === CombatActionTypes.useItem) {
      await Promise.all(results.map((r) => this.displayMessage(r.message)));
    }
    if (combatEvent.type === CombatActionTypes.defend) {
      await Promise.all(results.map((r) => this.displayMessage(r.message)));
    }
    // TODO: Hook this up so we don't have to use a wait here.
    // The goal is to get all of the cels in all of the grids to tell us when every single
    // one is done updating, and only when the last cel is done do we continue.
    // Right now we use wait :x
    await wait(500);
    await Promise.all(
      results.map(async (r) => {
        const target = r.target;
        await this.resolveTargetDeaths(target);
      })
    );
    this.startLoop();
  }

  private async handleBattleEnd() {
    const audio = <AudioScene>this.scene.scene.get("Audio");
    audio.stop(this.scene["music"]);
    audio.playSound("victory");

    await this.displayMessage(["You've won!"]);
    await this.distributeLoot();
    return this.scene.events.emit("end-battle", {
      victorious: true,
      flagsToFlip: this.victoryFlags,
    });
  }

  private updateCombatGrids(): Promise<any> {
    return new Promise((resolve) => {
      this.scene.events.emit("update-combat-grids");
      this.scene.events.on("finish-update-combat-grids", () => {
        this.scene.events.off("finish-update-combat-grids");
        resolve();
      });
    });
  }

  /**
   * Play death animations and sounds, reward coins and experience and items
   * @param target
   */
  private async resolveTargetDeaths(target) {
    return new Promise(async (resolve) => {
      if (target && target.currentHp === 0) {
        if (target.type === CombatantType.enemy) {
          const container = target.getSprite().parentContainer;
          const cel = this.enemyContainer.getCombatCelByCombatant(target);
          const deathAnimation = async () => {
            return new Promise((resolve) => {
              const sprite = target.getSprite();
              scaleUpDown(sprite, this.scene, async () => {
                const audio = <AudioScene>this.scene.scene.get("Audio");
                audio.playSound("dead");

                const hitEffect = this.effectsRepository.getById(3);
                await hitEffect.play(
                  sprite.x,
                  sprite.y,
                  this.scene,
                  sprite.parentContainer
                );

                resolve();
                cel.destroyEnemy();
              }).play();
            });
          };

          await deathAnimation();
          await this.lootEnemy(target, container);

          const index = this.enemies.findIndex(
            (enemy) => enemy.entity.uid === target.uid
          );
          if (index > -1) {
            this.enemies.splice(index, 1);
          }
        } else if (target.type === CombatantType.partyMember) {
          target.handleFaint();
          await this.displayMessage([`${target.name} has fainted!`]);

          if (
            this.partyMembers.every((partyMember) =>
              partyMember.entity.status.has(Status.fainted)
            )
          ) {
            await this.displayMessage(["Your party has been defeated..."]);
            this.scene.events.emit("game-over");
          }
        }
      }
      resolve();
    });
  }

  private async lootEnemy(target: any, container: any) {
    const tf = new TextFactory(this.scene);
    const sprite = target.getSprite();

    this.lootCrate.coin += target.goldValue;
    // ===================================
    // Coins
    // ===================================
    // const coinScaleUp = () => {
    //   const coinText = tf.createText(`${target.goldValue} coins`, { x: sprite.x, y: sprite.y }, '32px', {
    //     fill: '#ffffff'
    //   });
    //   this.scene.sound.play('coin', { volume: .4 })

    //   container.add(coinText);
    //   return new Promise((resolve) => {
    //     textScaleUp(coinText,0, -120, this.scene, () => {
    //       resolve();
    //     }).play();
    //   });
    // }
    // coinScaleUp()

    // ===================================
    // items
    // ===================================

    target.lootTable.forEach((itemObject) => {
      const roll = Math.random();
      const winningRoll = roll < itemObject.rate;
      if (winningRoll) {
        this.lootCrate.itemIds.push(itemObject.itemId);
      }
    });

    // ===================================
    // experience
    // ===================================
    this.lootCrate.experiencePoints += Math.ceil(
      target.experiencePoints * (target.level / 2 + 1)
    );

    const expScaleUp = () => {
      const coinText = tf.createText(
        `${target.goldValue}xp`,
        { x: sprite.x, y: sprite.y },
        "32px",
        {
          fill: "#ffffff",
        }
      );
      container.add(coinText);
      return new Promise((resolve) => {
        textScaleUp(coinText, 0, -80, this.scene, () => {
          resolve();
        }).play();
      });
    };
    await expScaleUp();
  }

  private async distributeExperience(experience) {
    const messages = [];
    this.partyMembers.forEach((partyMember) => {
      const partyEntity = <PartyMember>partyMember.entity;
      if (partyEntity.currentHp > 0) {
        const hasLeveledUp = partyEntity.gainExperience(experience);
        if (hasLeveledUp) {
          const audio = <AudioScene>this.scene.scene.get("Audio");
          audio.playSound("level-up");
          messages.push(
            `${partyEntity.name} has reached level ${partyEntity.level}`
          );
        }
      }
    });
    if (messages) {
      await this.displayMessage(messages);
    }
  }

  private async distributeLoot() {
    const itemMessages = this.handleItemDistribution();
    await this.displayMessage([
      `Each member receives ${this.lootCrate.experiencePoints} XP.`,
    ]);
    await this.distributeExperience(this.lootCrate.experiencePoints);
    State.getInstance().playerContents.addCoins(this.lootCrate.coin);
    await this.displayMessage([
      ...itemMessages,
      `The party receives ${this.lootCrate.coin} coins.`,
    ]);
  }

  private handleItemDistribution(): string[] {
    const items = this.lootCrate.itemIds.map((id) =>
      this.state.addItemToContents(id)
    );
    if (!items.length) {
      return [];
    }
    const itemObjects: any = items.reduce((acc, item) => {
      if (acc.hasOwnProperty(item.id)) {
        acc[item.id].amount += 1;
      } else {
        acc[item.id] = {};
        acc[item.id].name = item.name;
        acc[item.id].amount = 1;
      }
      return acc;
    }, {});
    return Object.keys(itemObjects).map(
      (key) =>
        `Received ${itemObjects[key].amount} ${itemObjects[key].name}${
          itemObjects[key].amount > 1 ? "s" : ""
        }. `
    );
  }
  //TODO: Make this message composable;
  /**
   * Function that resolves after the message scene is done doing its thing.
   * @param message
   */
  displayMessage(message: string[]): Promise<any> {
    const dialogScene = this.scene.scene.get("DialogScene");
    const scenePlugin = new Phaser.Scenes.ScenePlugin(dialogScene);
    return new Promise((resolve) => {
      scenePlugin.setActive(false, "Battle");
      scenePlugin.start("DialogScene", {
        callingSceneKey: "Battle",
        color: "dialog-white",
        message,
      });

      scenePlugin.setActive(true, "DialogScene").bringToTop("DialogScene");
      dialogScene.events.once("close-dialog", () => {
        resolve();
      });
    });
  }

  private resetPartyFocusIndex() {
    this.currentPartyFocusIndex = -1;
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
    this.enemyContainer.populateContainer();
  }

  public handleMessagesClose() {
    throw new Error("Not Yet Implemented");
  }
}
