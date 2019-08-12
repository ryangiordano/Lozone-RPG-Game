import { Combatant } from "../Combatant";
import { MpBar, HpBar } from "../../UI/Bars";

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
      const scene = combatant.getSprite().parentContainer['scene'];
      this.combatantBars = new CombatantBars(scene, combatant);
      this.combatantBars.setUpBars();

      scene.events.on('update-combat-grids', () => {
        this.updateBars();
      })
      return true;
    }

    return false;
  }
  updateBars() {
    return new Promise(async resolve=>{
      if(this.combatantBars){
        await this.combatantBars.update();
      }
      resolve();
    })

    
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
  update(): Promise<any> {
    return new Promise(async resolve => {
      const updates = [
        this.updateMpBar(),
        this.updateHpBar()
      ]
      await Promise.all(updates);
      resolve();
    })

  }
  async updateMpBar(): Promise<any> {
    return new Promise(async resolve => {
      await this.mpBar.setCurrentValue(this.combatant.currentMp);
      resolve();
    })

  }
  async updateHpBar(): Promise<any> {
    return new Promise(async resolve => {
      await this.hpBar.setCurrentValue(this.combatant.currentHp);
      resolve();
    })
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
      container.bringToTop(this.hpBar)
      container.bringToTop(this.mpBar)
    }
  }
}