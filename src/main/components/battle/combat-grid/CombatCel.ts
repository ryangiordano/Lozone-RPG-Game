import { Combatant } from "../Combatant";
import { MpBar, HpBar } from "../../../scenes/UI/partyMenuScene";

export class CombatCel {
  private combatantBars: CombatantBars;
  constructor(private pixelCoordinates: Coords, private combatantInCel?: Combatant) {

  }
  getX() {
    return this.pixelCoordinates.x;
  }
  getY() {
    return this.pixelCoordinates.y;
  }
  get(): Combatant {
    return this.combatantInCel;
  }
  set(combatant: Combatant): boolean {
    if (this.isEmpty()) {
      this.combatantInCel = combatant;
      this.combatantInCel.getSprite().setX(this.getX());
      this.combatantInCel.getSprite().setY(this.getY());
      this.combatantBars = new CombatantBars(combatant.getSprite().parentContainer['scene'], combatant);
      this.combatantBars.setUpBars();
      return true;
    }

    return false;
  }
  updateBars() {
    this.combatantBars && this.combatantBars.update();
  }
  isEmpty() {
    return !this.combatantInCel;
  }



}



class CombatantBars {
  public mpBar: MpBar;
  public hpBar: HpBar;
  /**
   * Handle setting and updating HP and MP bars of combatants in combat.
   */
  constructor(
    private scene,
    private combatant: Combatant) {

  }
  update() {
    this.updateMpBar();
    this.updateHpBar();
  }
  updateMpBar() {
    this.mpBar.setCurrentValue(this.combatant.currentMp);

  }
  updateHpBar() {
    this.hpBar.setCurrentValue(this.combatant.currentHp);
  }
  setUpBars() {
    this.hpBar = new HpBar(this.scene,
      { x: this.combatant.getSprite().x, y: this.combatant.getSprite().y + 45 }, this.combatant.currentHp, this.combatant.getMaxHp());
    this.mpBar = new MpBar(this.scene,
      { x: this.combatant.getSprite().x, y: this.combatant.getSprite().y + 55 }, this.combatant.currentMp, this.combatant.getMaxMp());
    if (this.combatant.getSprite().parentContainer) {
      const container = this.combatant.getSprite().parentContainer;
      container.add(this.hpBar)
      container.add(this.mpBar)
    }
  }
}