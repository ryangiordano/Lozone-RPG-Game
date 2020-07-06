import { State } from "../../utility/state/State";
import { Combat, BattleState } from "../../components/battle/Combat";
import { EnemyController } from "../../data/controllers/EnemyController";
import { EnemyParty } from "../../components/battle/Party";
import { AudioScene } from "../audioScene";
import { sceneFadeIn, sceneFadeOut } from "../camera";

export class CombatScene extends Phaser.Scene {
  private previousSceneKey: string;
  private enemyController: EnemyController;
  private combat: Combat;
  private music: string;
  private levelUp: Phaser.Sound.BaseSound;
  constructor() {
    super("Battle");
  }

  preload(): void {}

  async init(data) {
    sceneFadeIn(this.cameras.main, 500);

    this.sound.add("hit");
    this.sound.add("heal");
    this.sound.add("dead");
    this.sound.add("kill");
    this.sound.add("faint");
    this.sound.add("coin");
    this.levelUp = this.sound.add("level-up");
    this.enemyController = new EnemyController(this.game);
    this.previousSceneKey = data.key;
    this.add
      .image(0, 0, "dungeon_battle_background")
      .setOrigin(0, 0)
      .setScale(0.5, 0.5);

    const party = State.getInstance().getCurrentParty();

    const enemyPartyArray = this.enemyController.getEnemyPartyById(
      data.enemyPartyId
    );
    const enemyParty = new EnemyParty(enemyPartyArray.entities, this.game);

    this.combat = new Combat(this, party.getMembers(), enemyParty.getMembers());

    this.events.once("end-battle", async (battleState: BattleState) => {
      if (battleState.victorious && battleState.flagsToFlip.length) {
        const sm = State.getInstance();
        battleState.flagsToFlip.forEach((flag) => sm.setFlag(flag, true));
      }
      await this.endBattle();
      this.backToPreviousScene();
    });
    this.events.once("game-over", async (battleState: BattleState) => {
      await this.endBattle();
      this.scene.run("GameOverScene", {
        key: this.scene.key,
      });
    });
    this.music = data.bossBattle ? "boss-battle" : "battle";
    const audio = <AudioScene>this.scene.get("Audio");
    audio.play(this.music, true);
  }

  private async endBattle() {
    return new Promise(async (resolve) => {
      this.events.off("end-battle");
      this.events.off("game-over");
      this.events.off("update-combat-grids");
      this.events.off("finish-update-combat-grids");
      this.events.off("run-battle");
      await sceneFadeOut(this.cameras.main, 500);
      this.scene.stop();
      const audio = <AudioScene>this.scene.get("Audio");
      audio.stop(this.music);
      resolve();
    });
  }

  private async backToPreviousScene() {
    this.scene.manager.wake(this.previousSceneKey);
    this.scene.bringToTop(this.previousSceneKey);
    const scene = this.scene.manager.getScene(this.previousSceneKey);
    scene.events.emit("battle-finish");
  }
}
