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
  id: number,
  position: Coords
}

export class HeroParty {
  private partyController: PartyController;
  private members: CombatEntity[] = [];
  //TODO: Maybe store the grid size as a global...
  private placementManager = new PlacementManager({ x: 3, y: 3 });
  constructor(combatEntities: CombatEntity[], game: Phaser.Game) {
    this.partyController = new PartyController(game);
    combatEntities.forEach((entity) => this.addMember(entity));
    this.members.forEach(member => member.entity.setParty(this));
  }
  addMember(entity:CombatEntity) {

    if (entity && !this.members.find(member => member.entity.id === entity.entity.id)) {
      this.members.push(entity);
      return true;
    }
    return false;
  }
  getParty(): CombatEntity[] {
    return this.members;
  }

}

export class EnemyParty {
  private enemyController: EnemyController;
  private members: CombatEntity[] = [];
  constructor(enemyPartyId: number, game: Phaser.Game) {
    this.enemyController = new EnemyController(game);
    const enemyParty = this.enemyController.getEnemyPartyById(enemyPartyId);
    enemyParty.entities.forEach((enemy) => this.addEnemy(enemy));
    this.members.forEach(member => member.entity.setParty(this));
  }
  addEnemy(enemy: CombatEntity) {
    this.members.push(enemy);
    return true;
  }

  getParty(): CombatEntity[] {
    return this.members;
  }
}

