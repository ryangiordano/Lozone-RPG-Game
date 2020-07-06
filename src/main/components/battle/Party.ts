import { Combatant } from "./Combatant";
import { PartyController } from "../../data/controllers/PartyController";
import { PartyMember } from "./PartyMember";
import { Enemy } from "./Enemy";
import { EnemyController } from "../../data/controllers/EnemyController";
import { IEntityParty, CombatEntity } from "./CombatDataStructures";
import { Grid } from "../../utility/Grid";

export class PlacementManager {
  private placementGrid: Grid;
  constructor(size: Coords) {
    this.placementGrid = new Grid(size);
  }
  swap(from: Coords, to: Coords) {
    this.placementGrid.swap(from, to);
  }

  placeAt(coords: Coords, entityId: number) {
    if (this.emptyAt(coords)) {
      this.placementGrid.placeAt(coords, entityId);
    }
  }
  emptyAt(coords: Coords): boolean {
    return this.placementGrid.emptyAt(coords);
  }
}

export type Placement = {
  id: number;
  position: Coords;
};

export class Party {
  protected members: CombatEntity[] = [];
  constructor(combatEntities: CombatEntity[], game: Phaser.Game) {}
  getMembers(): CombatEntity[] {
    return this.members;
  }
}

export class HeroParty extends Party {
  private partyController: PartyController;

  private placementManager = new PlacementManager({ x: 3, y: 3 });
  constructor(combatEntities: CombatEntity[], game: Phaser.Game) {
    super(combatEntities, game);
    this.partyController = new PartyController(game);
    combatEntities.forEach((entity) => this.addMember(entity));
    this.members.forEach((member) => member.entity.setParty(this));
  }
  addMember(entity: CombatEntity) {
    if (
      entity &&
      !this.members.find((member) => member.entity.id === entity.entity.id)
    ) {
      this.members.push(entity);
      return true;
    }
    return false;
  }

  fullHeal() {
    this.members.forEach((m) => {
      m.entity.currentHp = m.entity.getMaxHp();
      m.entity.currentMp = m.entity.getMaxMp();
      m.entity.status = new Set();
    });
  }
}

export class EnemyParty extends Party {
  constructor(enemyPartyArray: CombatEntity[], game: Phaser.Game) {
    super(enemyPartyArray, game);
    enemyPartyArray.forEach((enemy) => this.addEnemy(enemy));
    this.members.forEach((member) => member.entity.setParty(this));
  }
  addEnemy(enemy: CombatEntity) {
    this.members.push(enemy);
    return true;
  }
}
