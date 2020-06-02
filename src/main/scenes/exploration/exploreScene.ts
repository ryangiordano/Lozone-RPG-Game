import {
  EntityTypes,
  WarpTrigger,
  Spawn,
  Entity,
  KeyItem,
} from "../../components/entities/Entity";
import { Cast } from "../../components/entities/Cast";
import { Player } from "../../components/entities/Player";
import { wait } from "../../utility/Utility";
import { State } from "../../utility/state/State";
import { KeyboardControl } from "../../components/UI/Keyboard";
import { WarpUtility } from "../../utility/exploration/Warp";
import { MapObjectFactory } from "../../utility/exploration/ObjectLoader";
import { EffectsRepository } from "../../data/repositories/EffectRepository";
import { textScaleUp, fadeInOur } from "../../utility/tweens/text";
import { Item } from "../../components/entities/Item";
import { sceneFadeIn, battleZoom } from "../camera";
import { AudioScene } from "../audioScene";

class EntityGroup extends Phaser.GameObjects.Group {}

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
    this.setEvents();

    this["updates"].addMultiple([this.player]);

    this.afterCreated();
  }

  protected afterCreated() {}

  protected setEvents() {
    this.input.keyboard.on("keyup-Z", (event) => {
      if (this.player.isMoving) {
        return false;
      }
      this.scene.setActive(false, this.scene.key);
      this.game.scene.start("MenuScene", { callingSceneKey: this.scene.key });
      this.scene.setActive(true, "MenuScene").bringToTop("MenuScene");
    });

    this.events.on("item-acquired", this.acquiredItemCallback, this);
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
      const keyItem = <KeyItem>entity;
      if (
        keyItem.entityType === EntityTypes.warp ||
        keyItem.entityType === EntityTypes.keyItem
      ) {
        //TODO: Refactor all of this so all items that have placement flags use placementFlags
        const sm = State.getInstance();

        const placementFlags = keyItem.properties["placementFlag"]
          ? [keyItem.properties["placementFlag"]]
          : keyItem.properties["placementFlags"];

        ((keyItem.setPlaced &&
          keyItem.properties.hasOwnProperty("placementFlag")) ||
          keyItem.properties.hasOwnProperty("placementFlags")) &&
          keyItem.setPlaced(
            sm.allAreFlagged(placementFlags) &&
              !sm.isFlagged(keyItem.properties["flagId"])
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
        // Ensures we're not touching ourselves.  Gross.
        if (cast.caster === interactive) return false;
        cast.emit("resolve", { castedOn: interactive, caster: cast.caster });
        // Ensures that only the player can trigger entities when querying.
        if (cast.caster.entityType !== EntityTypes.player) return false;
        // TODO: Do a check to make sure the cast's castType === the entity's triggeringCastType
        if (interactive.entityType === EntityTypes.bossMonster) {
          await this.displayMessage(interactive.getCurrentDialog());
          this.startEncounter(interactive.encounterId, true);
          interactive.destroy();
          cast.destroy();
        }

        if (interactive.entityType === EntityTypes.interactive) {
          await this.displayMessage(interactive.properties.message);
          cast.destroy();
        }

        if (interactive.entityType === EntityTypes.npc) {
          this.displayMessage(interactive.getCurrentDialog());
          cast.destroy();
        }

        if (interactive.entityType === EntityTypes.chest) {
          this.handleOpenChest(interactive);
          cast.destroy();
        }

        if (interactive.entityType === EntityTypes.keyItem) {
          if (interactive.active) {
            cast.destroy();
            interactive.pickup();
          }
        }

        if (interactive.entityType === EntityTypes.door) {
          this.handleOpenDoor(interactive);
          cast.destroy();
        }
        if (interactive.entityType === EntityTypes.warp) {
          if (interactive.active) {
            this.handleWarp(interactive);
            cast.destroy();
          }
        }

        if (interactive.entityType === EntityTypes.itemSwitch) {
          cast.destroy();
          const sm = State.getInstance();

          if (sm.playerHasItem(interactive.getKeyItemId())) {
            sm.consumeItem(interactive.getKeyItemId());
            interactive.activateSwitch();
            await this.displayMessage(interactive.getActivateDialog());
          } else {
            await this.displayMessage(interactive.getCurrentDialog());
          }
        }
        this.refreshInteractivesByFlag();
      }
    );
  }

  protected async handleOpenChest(interactive) {
    const sm = State.getInstance();
    if (interactive.locked) {
      const keyItem = sm.getItemOnPlayer(interactive.unlockItemId);
      if (keyItem) {
        interactive.unlock();
        await this.displayMessage([
          `You unlock the chest with a ${keyItem.name}`,
        ]);
        sm.consumeItem(interactive.unlockItemId);
        await wait(300);
        interactive.openChest();
      } else {
        this.displayMessage(["The chest is locked."]);
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
      interactive.unlock();
      await this.displayMessage([interactive.unlockMessage]);
      return;
    }
    await this.displayMessage([interactive.lockMessage]);
  }

  protected handleWarp(interactive) {
    this.events.off("item-acquired", this.acquiredItemCallback);
    const warp = this.warpUtility.getWarp(interactive.warpId);
    this.warpUtility.warpTo(warp.warpDestId);
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

  async acquiredItemCallback({ itemId, flagId, chestCoords }) {
    const sm = State.getInstance();
    const item = sm.addItemToContents(itemId);
    sm.setFlag(flagId, true);
    this.player.controllable.setDisabled(true);
    const audio = <AudioScene>this.scene.get("Audio");
    //TODO: Improve this
    if (item.sound === "great-key-item-collect") {
      audio.play(item.sound, true, false, 0.1);
    } else {
      audio.playSound(item.sound, 0.1);
    }
    // item float above here
    await this.animateItemAbove(item, { x: chestCoords.x, y: chestCoords.y });

    await this.displayMessage([`Lo got ${item.name}`]);
    await wait(300);
    this.player.controllable.setDisabled(false);
  }

  async animateItemAbove(item: Item, coords: Coords) {
    return new Promise((resolve) => {
      const itemSprite = new Phaser.GameObjects.Sprite(
        this,
        coords.x,
        coords.y,
        item.spriteKey
      );
      itemSprite.setFrame(item.frame);
      this.add.existing(itemSprite);
      const tween = textScaleUp(itemSprite, 0, -80, this, () => {
        itemSprite.destroy();
        resolve();
      });
      tween.play();
    });
  }

  displayMessage(message: string[]): Promise<any> {
    return new Promise((resolve) => {
      this.player.controllable.setDisabled(true);

      this.scene.setActive(false, this.scene.key);
      this.game.scene.start("DialogScene", {
        callingSceneKey: this.scene.key,
        color: "dialog-white",
        message,
      });
      this.scene.setActive(true, "DialogScene").bringToTop("DialogScene");
      const dialog = this.game.scene.getScene("DialogScene");
      dialog.events.on("close-dialog", () => {
        this.player.controllable.setDisabled(false);

        resolve();
      });
    });
  }

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
