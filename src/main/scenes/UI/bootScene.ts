import { WHITE } from "./../../utility/Constants";
import { AnimationHelper } from "../../utility/tweens/animation-helper";
import { State } from "../../utility/state/State";
import { BLACK } from "../../utility/Constants";

export class BootScene extends Phaser.Scene {
  private loadingBar: Phaser.GameObjects.Graphics;
  private progressBar: Phaser.GameObjects.Graphics;
  private loaded: boolean = false;
  constructor() {
    super({ key: "BootScene" });
  }

  public init() {
    if (this.loaded) {
      this.runStartupProcess();
    }
  }
  private runStartupProcess() {
    const animationHelper = new AnimationHelper(this);
    animationHelper.createGameAnimations(
      this.cache.json.get("ryanAndLoAnimation").anims
    );
    animationHelper.createGameAnimations(
      this.cache.json.get("animated-spell-effects").anims
    );
    animationHelper.createGenericGameAnimations(
      ["lo", "yaya", "tuzi", "aris", "ryan"],
      this.cache.json.get("npcSpriteAnimation").anims
    );
    animationHelper.createGenericGameAnimations(
      ["laundromancer-sprite", "wanmonster-sprite", "cosmoknight-sprite"],
      this.cache.json.get("bossMonsterSpriteAnimation").anims
    );

    animationHelper.createGameAnimations(
      this.cache.json.get("overworld").anims
    );

    const sprite = this.add.sprite(320, 265, "ryanandlo");
    sprite.scaleX = 1;
    sprite.scaleY = 1;
    sprite.anims.play("shine-in");
    sprite.on("animationcomplete", () => {
      this.sound.play("startup", { volume: 0.1 });

      this.add.text(210, 310, "Catshape Daruma®", {
        fontFamily: "pixel",
        fontSize: "20px",
        fill: BLACK.hex,
        fontWeight: "bold",
      });

      setTimeout(() => {
        this.scene.start("Audio");
        this.scene.start("House", { map: "room", tileset: "room-tiles" });
      }, 1);
    });

    // When we get to the point  where we can save state to a JSON, this is where we'd load it in, flipping the proper flags.
    const sm = State.getInstance();
    sm.initialize(this.game);

    // ===================================
    // Start the scene in Debug Mode
    // ===================================
    // this.scene.start('House', { map: 'room', tileset: 'room-tiles' });
    // const tempParty = [13, 1, 2, 3, 4, 5];
    // this.scene.start("GameOverScene", { map: "room", tileset: "room-tiles" });
  }

  preload(): void {
    this.sound.add("startup");
    this.cameras.main.setBackgroundColor(WHITE.hex);
    this.createLoadingGraphics();
    this.load.on("complete", () => {
      this.loaded = true;
      this.runStartupProcess();
    });
    // Load the packages
    this.load.pack(
      "preload_spritesheets",
      "./src/main/assets/pack/spritesheets.json",
      "preload_spritesheets"
    );
    this.load.pack(
      "preload_images",
      "./src/main/assets/pack/image.json",
      "preload_images"
    );
    this.load.pack(
      "preload_audio",
      "./src/main/assets/pack/audio.json",
      "preload_audio"
    );
    this.load.pack(
      "preload_data",
      "./src/main/assets/pack/data.json",
      "preload_data"
    );
    this.load.pack(
      "preload_tilemaps",
      "./src/main/assets/pack/tilemaps.json",
      "preload_tilemaps"
    );

    this.load.pack("preload", "./src/main/assets/pack.json", "preload");
  }
  private createLoadingGraphics(): void {
    // We can specify the type of config we want to send.
  }
}
