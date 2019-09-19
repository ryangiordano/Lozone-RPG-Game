import { CombatGrid } from "./CombatGrid";
import { getRandomFloor } from "../../../utility/Utility";
import { Combatant } from "../Combatant";
import { CombatEntity } from "../CombatDataStructures";
import { cursorHover } from "../../../utility/tweens/text";
import { CombatCel } from './CombatCel';

export class CombatContainer extends Phaser.GameObjects.Container {
  private combatGrid: CombatGrid = new CombatGrid({ x: 3, y: 3 }, 64);
  private cursor: Phaser.GameObjects.Sprite;
  private cursorAnimation: any;

  constructor(position: Coords, scene, private combatants: CombatEntity[] = []) {
    super(scene, position.x * 64, position.y * 64);
    this.cursor = new Phaser.GameObjects.Sprite(this.scene, 100, 100, 'cursor');
    this.cursorAnimation = cursorHover(this.cursor, 0, this.scene, () => { });
    this.add(this.cursor)
    this.showCursor(false)
  }

  public populateContainerAt(position: Coords, combatant: Combatant) {
    if (!this.combatGrid.emptyAt(position)) {
      throw new Error(`Already placed at [${position.x}, ${position.y}]`);
    }
    this.combatGrid.placeAt(position, combatant);
  }

  public setCursor(sprite) {
    this.showCursor(true);
    this.bringToTop(this.cursor)
    this.cursor.setX(sprite.x);
    this.cursor.setY(sprite.y - (sprite.height / 2))
    this.beginCursorAnimate();
  }

  public setMultiCursor() {
    this.combatGrid.getAllTargets().forEach(target => {
      // Set a cursor on top of each target's head.
      const cursor = new Phaser.GameObjects.Sprite(this.scene, 100, 100, 'cursor');
      this.add(cursor);
      cursor.setX(target.getX());
      cursor.setY(target.getY()-(target.get().sprite.height/2));
      const cursorAnimation = cursorHover(cursor, 0, this.scene, () => { });
      cursorAnimation.play();
    })
  }

  public unsetMultiCursor() {
    this.getAll('type', 'sprite').forEach(child => {
      console.log(child)
      // child.destroy()
    });
  }

  public showCursor(visible: boolean) {
    this.cursor.visible = visible;
  }

  private beginCursorAnimate() {
    this.cursorAnimation.stop();
    this.cursorAnimation = cursorHover(this.cursor, 0, this.scene, () => { });
    this.cursorAnimation.play();

  }

  public populateContainer() {
    this.combatants.forEach(combatant => {
      const sprite = combatant.entity.getSprite();
      this.add(sprite);
      this.combatGrid.placeAt(combatant.position, combatant.entity);
      sprite.setOrigin(.5, .5);
      sprite.setAlpha(1);
    });
  }

  public populateContainerRandomly() {
    this.combatants.forEach(combatant => {
      const sprite = combatant.entity.getSprite();
      this.add(sprite);
      const y = getRandomFloor(this.combatGrid.getHeight());
      this.combatGrid.placeAtRandomOpenPosition(combatant.entity);
      y > 1 ? this.bringToTop(sprite) : this.sendToBack(sprite);
      sprite.setOrigin(.5, .5);
      sprite.setAlpha(1);
    });
    this.combatGrid.grid.forEach((row) => {
      row.forEach((cel) => {
        const combatant = cel.get();
        if (combatant) {
          this.bringToTop(combatant.getSprite());
        }
      })
    })
  }

  addCombatant(combatant: Combatant) {
    this.add(combatant.getSprite());
  }

  public getCombatants() {
    return this.combatants;
  }

  public targetRow(row) {

  }

  public targetColumn(column) {

  }
  public targetAll() {
    this.setMultiCursor();
  }
  public untargetAll() {
    this.unsetMultiCursor();
  }
}
