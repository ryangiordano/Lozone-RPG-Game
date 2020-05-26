import { State } from "../../utility/state/State";
import { Combat, BattleState } from "../../components/battle/Combat";
import { EnemyController } from "../../data/controllers/EnemyController";
import { EnemyParty } from "../../components/battle/Party";
import { getRandomFloor } from "../../utility/Utility";
import { AudioScene } from "../audioScene";

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

  init(data) {
    this.sound.add("hit");
    this.sound.add("heal");
    this.sound.add("dead");
    this.sound.add("level-up");
    this.sound.add("coin");
    this.sound.add("victory");
    this.levelUp = this.sound.add("level-up");
    this.enemyController = new EnemyController(this.game);
    this.previousSceneKey = data.key;
    this.add
      .image(0, 0, "dungeon_battle_background")
      .setOrigin(0, 0)
      .setScale(0.5, 0.5);

    const party = State.getInstance().getCurrentParty();

    const enemyParty = new EnemyParty(data.enemyPartyId, this.game);

    this.combat = new Combat(this, party.getParty(), enemyParty.getParty());

    this.events.once("end-battle", (battleState: BattleState) => {
      if (battleState.victorious && battleState.flagsToFlip.length) {
        const sm = State.getInstance();
        battleState.flagsToFlip.forEach((flag) => sm.setFlag(flag, true));
      }
      this.endBattle();
      this.backToPreviousScene();
    });
    this.events.once("game-over", (battleState: BattleState) => {
      this.endBattle();
      this.scene.run("GameOverScene", {
        key: this.scene.key,
      });
    });
    this.music = data.bossBattle ? "boss-battle" : "battle";
    const audio = <AudioScene>this.scene.get("Audio");
    audio.play(this.music, true);
  }

  private endBattle() {
    this.events.off("end-battle");
    this.events.off("game-over");
    this.events.off("update-combat-grids");
    this.events.off("finish-update-combat-grids");
    this.events.off("run-battle");

    this.scene.stop();
    const audio = <AudioScene>this.scene.get("Audio");
    audio.stop(this.music);
  }

  private backToPreviousScene() {
    this.scene.manager.wake(this.previousSceneKey);
    this.scene.bringToTop(this.previousSceneKey);
    const scene = this.scene.manager.getScene(this.previousSceneKey);
    scene.events.emit("battle-finish");
  }
}
