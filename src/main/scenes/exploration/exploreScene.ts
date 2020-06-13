import { EntityTypes, Entity } from "../../components/entities/Entity";
import { Cast } from "../../components/entities/Cast";
import { Player } from "../../components/entities/Player";
import { wait } from "../../utility/Utility";
import { State } from "../../utility/state/State";
import { KeyboardControl } from "../../components/UI/Keyboard";
import { WarpUtility } from "../../utility/exploration/Warp";
import { MapObjectFactory } from "../../utility/exploration/ObjectLoader";
import { textScaleUp } from "../../utility/tweens/text";
import { Item } from "../../components/entities/Item";
import { sceneFadeIn, battleZoom } from "../camera";
import { AudioScene } from "../audioScene";
import { WarpTrigger, Spawn } from "../../components/entities/Warp";
import { displayMessage } from "../dialogScene";
import { EventsController } from "../../data/controllers/EventsController";
import { animateItemAbove } from "../../utility/AnimationEffects/item-collect";

export abstract class Explore extends Phaser.Scene {
  public map: Phaser.Tilemaps.Tilemap;
  private tileset: Phaser.Tilemaps.Tileset;
  private backgroundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private foregroundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private interactive: Phaser.GameObjects.Group;
  private casts: Phaser.GameObjects.Group;
  protected keyboardControl: KeyboardControl;
  protected player: Player;
  protected playerIsMoving: boolean = false;
  public warpDestId: number = null;
  private warpUtility: WarpUtility;
  private mapObjectFactory: MapObjectFactory;
  private eventsController: EventsController;
  constructor(key) {
    super({
      key: key || "Explore",
    });
  }

  gbFadeIn(callback = null) {
    const alpha = this.cameras.main.alpha;
    const camera = this.cameras.main;
    if (alpha < 1) {
      setTimeout(() => {
        camera.alpha = alpha + 0.25;
        this.gbFadeIn(callback);
      }, 150);
    }
  }

  async init(data) {
    sceneFadeIn(this.cameras.main);

    // Specify the tileset you want to use based on the data passed to the scene.
    const { map, tileset, warpDestId } = data;
    this.map = this.make.tilemap({ key: map });
    this.tileset = this.map.addTilesetImage(tileset, tileset, 64, 64, 0, 0, 1);
    if (warpDestId) {
      this.warpDestId = warpDestId;
    }
    this.warpUtility = new WarpUtility(this);

    this.afterInit(data);
  }

  protected abstract afterInit(data);
  preload(): void {
    // TODO: Gather these into a map
    this.sound.add("bump");
    this.sound.add("beep");
    this.sound.add("chest");
    this.sound.add("lock-open");
    this.sound.add("unlock");
    this.sound.add("item-collect");
    this.sound.add("key-item-collect");
    this.sound.add("great-key-item-collect");

    this.events.on("battle-finish", () => {
      this.refreshInteractivesByFlag();
      this.player.controllable.setDisabled(false);
    });
    this.events.on("cast-delivered", (data) => {
      const { cast, castingEntity } = data;
      this.casts.add(cast);
    });
  }
  create(): void {
    this.mapObjectFactory = new MapObjectFactory(this);

    this.setGroups();
    this.setMapLayers();
    this.loadObjectsFromTilemap();
    this.setColliders();
    this.setPlayer();
    this.setupCamera();
    this.setEventsOn();

    this["updates"].addMultiple([this.player]);
    this.afterCreated();
  }

  async playEvent(id) {
    return new Promise(async (resolve) => {
      this.setEventsOff();
      this.player.controllable.setDisabled(true);
      this.eventsController = new EventsController(this.game);
      await this.eventsController.playEvent(id, this);
      resolve();
    });
  }

  protected afterCreated() {}

  protected setEventsOn() {
    this.input.keyboard.on("keyup-Z", (event) => {
      if (this.player.isMoving) {
        return false;
      }
      this.scene.setActive(false, this.scene.key);
      this.game.scene.start("MenuScene", { callingSceneKey: this.scene.key });
      this.scene.setActive(true, "MenuScene").bringToTop("MenuScene");
    });
  }

  protected setEventsOff() {
    this.input.keyboard.off("keyup-z");
  }

  protected setGroups() {
    this.interactive = this.add.group({
      runChildUpdate: true,
    });
    this.casts = this.add.group({
      runChildUpdate: true,
    });
  }

  protected loadObjectsFromTilemap() {
    const dataToLoad = this.mapObjectFactory.getDataToLoad();
    dataToLoad.interactives.forEach((d) => this.interactive.add(d));
  }

  /** Key items and warps are placed if they're placementFlag condition
   * has been satisfied.
   */
  refreshInteractivesByFlag() {
    this.interactive.children.entries.forEach((child) => {
      const entity = <Entity>child;
      const sm = State.getInstance();

      if (
        entity.entityType === EntityTypes.warp ||
        entity.entityType === EntityTypes.keyItem
      ) {
        //TODO: Refactor all of this so all items that have placement flags use placementFlags
        entity.setPlaced &&
          entity.hasPlacementFlags() &&
          entity.setPlaced(
            sm.allAreFlagged(entity.placementFlags) &&
              !sm.isFlagged(entity.flagId)
          );
      }
    });
  }

  private setPlayer() {
    const dropPoint =
      <WarpTrigger>(
        this.interactive.children.entries.find(
          (t) => t["warpId"] === this.warpDestId
        )
      ) ||
      <Spawn>(
        this.interactive.children.entries.find(
          (t) => t["entityType"] === EntityTypes.spawn
        )
      );

    this.player = new Player({
      scene: this,
      x: dropPoint.x,
      y: dropPoint.y,
      key: "lo",
    });
  }

  private setupCamera() {
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
  }

  protected setColliders() {
    this.physics.add.overlap(
      this.casts,
      this.interactive,
      async (cast: Cast, interactive: any) => {
        const destroyCastAndRefresh = () => {
          cast.destroy();
          this.refreshInteractivesByFlag();
        };
        // Ensures we're not touching ourselves.  Gross.
        if (cast.caster === interactive) return false;

        cast.emit("resolve", { castedOn: interactive, caster: cast.caster });
        // Ensures that only the player can trigger entities when querying.
        if (cast.caster.entityType !== EntityTypes.player) return false;

        this.player.controllable.setDisabled(true);
        this.input.keyboard.resetKeys();
        // TODO: Do a check to make sure the cast's castType === the entity's triggeringCastType
        if (interactive.entityType === EntityTypes.bossMonster) {
          await displayMessage(
            interactive.getCurrentDialog(),
            this.game,
            this.scene
          );
          this.startEncounter(interactive.encounterId, true);
          interactive.destroy();
          destroyCastAndRefresh();
        }

        if (interactive.entityType === EntityTypes.interactive) {
          await displayMessage(
            interactive.properties.message,
            this.game,
            this.scene
          );
          destroyCastAndRefresh();
        }

        if (interactive.entityType === EntityTypes.npc) {
          displayMessage(interactive.getCurrentDialog(), this.game, this.scene);
          destroyCastAndRefresh();
        }

        if (interactive.entityType === EntityTypes.chest) {
          this.handleOpenChest(interactive);
          destroyCastAndRefresh();
        }

        if (interactive.entityType === EntityTypes.keyItem) {
          if (interactive.active) {
            this.refreshInteractivesByFlag();
            cast.destroy();
            await interactive.pickup();
          }
        }

        if (interactive.entityType === EntityTypes.door) {
          this.handleOpenDoor(interactive);
          destroyCastAndRefresh();
        }

        if (interactive.entityType === EntityTypes.warp) {
          if (interactive.active) {
            this.handleWarp(interactive);
            this.refreshInteractivesByFlag();
            cast.destroy();
          }
        }

        if (interactive.entityType === EntityTypes.itemSwitch) {
          destroyCastAndRefresh();

          const sm = State.getInstance();

          if (sm.playerHasItem(interactive.getKeyItemId())) {
            sm.consumeItem(interactive.getKeyItemId());
            interactive.activateSwitch();
            await displayMessage(
              interactive.getActivateDialog(),
              this.game,
              this.scene
            );
          } else {
            await displayMessage(
              interactive.getCurrentDialog(),
              this.game,
              this.scene
            );
          }
        }
        this.player.controllable.setDisabled(false);
      }
    );
  }

  protected async handleOpenChest(interactive) {
    const sm = State.getInstance();
    if (interactive.locked) {
      const keyItem = sm.getItemOnPlayer(interactive.unlockItemId);
      if (keyItem) {
        interactive.unlock();
        await displayMessage(
          [`You unlock the chest with a ${keyItem.name}`],
          this.game,
          this.scene
        );
        sm.consumeItem(interactive.unlockItemId);
        await wait(300);
        interactive.openChest();
      } else {
        displayMessage(["The chest is locked."], this.game, this.scene);
      }
    } else {
      interactive.openChest();
    }
  }

  protected async handleOpenDoor(interactive) {
    const sm = State.getInstance();
    const keyItem = sm.getItemOnPlayer(interactive.unlockItemId);
    if (keyItem) {
      sm.setFlag(interactive.properties.id, true);
      await interactive.unlock();
      await displayMessage([interactive.unlockMessage], this.game, this.scene);
      return;
    }
    await displayMessage([interactive.lockMessage], this.game, this.scene);
  }

  protected async handleWarp(interactive) {
    if (interactive.properties.event) {
      this.playEvent(interactive.properties.event);
    } else {
      const warp = this.warpUtility.getWarp(interactive.warpId);
      this.warpUtility.warpTo(warp.warpDestId);
    }
  }

  protected setMapLayers() {
    this.backgroundLayer = this.map.createStaticLayer(
      "background",
      this.tileset
    );
    this.foregroundLayer = this.map.createStaticLayer(
      "foreground",
      this.tileset
    );
    this.backgroundLayer.setName("background");
    this.foregroundLayer.setName("foreground");
  }

  async acquiredItemCallback({ itemId, flagId, chestCoords }) {}

  protected async startEncounter(
    enemyPartyId: number,
    bossBattle: boolean = false
  ) {
    this.input.keyboard.resetKeys();
    this.player.controllable.setDisabled(true);
    const audio = <AudioScene>this.scene.get("Audio");
    audio.playSound("encounter", 0.1);
    await battleZoom(this.cameras.main);
    this.scene.manager.sleep(this.scene.key);

    this.scene.run("Battle", {
      key: this.scene.key,
      enemyPartyId,
      bossBattle: bossBattle,
    });
    this.cameras.main.zoom = 1;
  }
}
