import { EnemyController } from "../data/controllers/EnemyController";
import { StateManager } from "../utility/state/StateManager";
import { Enemy } from "../components/battle/Enemy";
import { Party } from "../components/battle/Party";
import { Combatant } from "../components/battle/Combatant";

export class BattleScene extends Phaser.Scene {
  private partyContainer: CombatContainer;
  private enemyContainer: CombatContainer;
  private enemyController: EnemyController;
  constructor() {
    super('Battle');
  }
  init(data) {
    const sm = StateManager.getInstance();
    const party = sm.getCurrentParty();
    this.enemyController = new EnemyController(this.game);
    this.add.image(0, 0, 'dungeon_battle_background').setOrigin(0, 0).setScale(.5, .5);
    const enemies = data.enemies;
    this.partyContainer = new CombatContainer({ x: 1 * 16, y: 3 * 16 }, this, party.getParty());
    this.enemyContainer = new CombatContainer({ x: 7 * 16, y: 3 * 16 }, this, enemies);

    this.add.existing(this.partyContainer);
    this.add.existing(this.enemyContainer);


    this.partyContainer.populateContainerRandomly();
    this.enemyContainer.populateContainerRandomly();
    // DEBUG
    this.input.keyboard.on('keydown', event => {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ESC) {
        this.scene.stop();
        this.scene.manager.wake(data.key);
        this.scene.bringToTop(data.key);
      }
    });
    // DEBUG
  }
}

class CombatSprite extends Phaser.GameObjects.Sprite {
  private combatant: Combatant;
  constructor(scene, x, y, combatant) {
    super(scene, x, y, combatant.spriteKey);
    this.combatant = combatant;
  }
  // Logic for manipulating the combatants....
}

class CombatContainer extends Phaser.GameObjects.Container {
  private combatSprites: CombatSprite[] = [];
  private combatGrid: CombatGrid = new CombatGrid({ x: 3, y: 3 }, 16);
  constructor(position: Coords, scene, combatants: Combatant[] = []) {
    super(scene, position.x, position.y);
    combatants.forEach(combatant => {
      this.combatSprites.push(new CombatSprite(scene, 0, 0, combatant).setAlpha(0));
    });

  }
  populateContainerRandomly() {
    let x = 0;
    let y = 0;
    this.combatSprites.forEach((combatSprite, i) => {
      this.add(combatSprite);
      // Get the last sprite and place it off from that.
      const y = Math.floor(Math.random() * 3);
      this.combatGrid.placeAtRandomOpenPosition(combatSprite);
      this.combatGrid.placeAt({ x: i, y }, combatSprite);
      y > 1 ? this.bringToTop(combatSprite) : this.sendToBack(combatSprite);
      combatSprite.setOrigin(.5,.5)

      combatSprite.setAlpha(1);
    });
  }
  addCombatant(combatSprite: CombatSprite) {
    this.add(combatSprite)
  }
}

class CombatGrid {
  public grid = [];
  constructor(private size: Coords, private celSize: number) {
    this.createGrid();
  }
  private createGrid() {
    for (let row = 0; row < this.size.y; row++) {
      this.grid.push([]);
      for (let col = 0; col < this.size.x; col++) {
        this.grid[row].push(new CombatCel({ x: col * this.celSize, y: row * this.celSize }))
      }
    }
  }
  public swap(from: Coords, to: Coords) {
    const temp = this.grid[from.y][from.x].get();
    this.grid[from.y][from.x].set(this.grid[to.y][to.x].get());
    this.grid[to.y][to.x].set(temp);
  }
  placeAt(position: Coords, combatSprite: CombatSprite) {
    const cel = this.grid[position.y][position.x];
    cel.set(combatSprite);

  }
  private flattenGrid() {
    return this.grid.reduce((acc, row) => {
      return [...acc, ...row]
    }, []);
  }
  placeAtRandomOpenPosition(combatSprite: CombatSprite) {
    const randomEmpty = this.findRandomEmptyCel();
    randomEmpty.set(combatSprite);
  }
  private findRandomEmptyCel() {
    const flattenedEmptyGrid: CombatCel[] = this.flattenGrid().filter(cel => cel.isEmpty);
    return flattenedEmptyGrid[Math.floor(Math.random() * flattenedEmptyGrid.length)]
  }
}

class CombatCel {
  constructor(private pixelCoordinates: Coords, private combatantInCel?: CombatSprite) {

  }
  getX() {
    return this.pixelCoordinates.x;
  }
  getY() {
    return this.pixelCoordinates.y;
  }
  get(): CombatSprite {
    return this.combatantInCel;
  }
  set(combatant: CombatSprite): boolean {
    if (this.isEmpty()) {
      console.log("Setting via pixelcoordinates")
      this.combatantInCel = combatant;
      this.combatantInCel.setX(this.pixelCoordinates.x);
      this.combatantInCel.setY(this.pixelCoordinates.y);

      return true;
    }
    return false;
  }
  isEmpty() {
    return !this.combatantInCel;
  }
}