import { Chest, KeyItem, LockedDoor, EntityTypes } from '../../assets/objects/Entity';
import { Cast } from "../../assets/objects/Cast";
import { Player } from "../../assets/objects/Player";
import { NPC, BossMonster } from '../../assets/objects/NPC';
import { Interactive } from "../../assets/objects/Interactive";
import { Directions, wait } from "../../utility/Utility";
import { Trigger } from "../../assets/objects/Trigger";
import { State } from "../../utility/state/State";
import { KeyboardControl } from "../../components/UI/Keyboard";
import { WarpUtility } from '../../utility/exploration/Warp';
import { ObjectLoader } from '../../utility/exploration/ObjectLoader';

export abstract class Explore extends Phaser.Scene {
  public map: Phaser.Tilemaps.Tilemap;
  private tileset: Phaser.Tilemaps.Tileset;
  private backgroundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private foregroundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private interactive: Phaser.GameObjects.Group;
  private casts: Phaser.GameObjects.Group;
  private triggers: Phaser.GameObjects.Group;
  protected keyboardControl: KeyboardControl;
  protected player: Player;
  protected playerIsMoving: boolean = false;
  public warpDestId: number;
  private warpUtility: WarpUtility;
  private objectLoader: ObjectLoader;
  constructor(key) {
    super({
      key: key || "Explore"
    });
    this.objectLoader = new ObjectLoader(this.casts, this);

  }
  init(data) {
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
    this.sound.add("get-item");
    this.sound.add("get-key-item");
  }
  create(): void {
    this.setGroups();
    this.setMapLayers();
    this.setPlayer();
    this.loadObjectsFromTilemap();
    this.setupCamera();
    this.setColliders();
    this.setEvents();

    this["updates"].addMultiple([this.player]);

    this.afterCreated();
  }
  protected afterCreated() { }
  protected setEvents() {
    this.input.keyboard.on("keydown-Z", event => {
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
      runChildUpdate: true
    });
    this.casts = this.add.group({
      runChildUpdate: true
    });
    this.triggers = this.add.group({
      runChildUpdate: true
    });
  }
  protected loadObjectsFromTilemap() {
    const dataToLoad = this.objectLoader.getDataToLoad();
    dataToLoad.interactives.forEach(d => this.interactive.add(d))
    dataToLoad.triggers.forEach(t => this.triggers.add(t));
  }

  private setPlayer() {
    const objects = this.map.getObjectLayer("objects").objects as any[];
    // ===================================
    // Spawn the player
    // ===================================
    let spawn;
    if (this.warpDestId) {
      spawn = objects.find(o =>
        o.type === "trigger" &&
        o.properties.find(p => p.name === "warpId").value === this.warpDestId
      );
    }
    if (!spawn) {
      spawn = objects.find(o => o.type === "spawn");
    }

    this.player = new Player({
      scene: this,
      x: spawn.x + 32,
      y: spawn.y + 32,
      key: "lo",
      map: this.map,
      casts: this.casts
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

  // Handle collision with casts on all types of entities.
  protected setColliders() {
    this.physics.add.overlap(
      this.casts,
      this.interactive,
      async (cast: Cast, interactive: any) => {
        cast.destroy();
        this.player.stop();

        if (interactive.entityType === EntityTypes.bossMonster) {
          await this.displayMessage(interactive.getCurrentDialog())
          interactive.triggerBattle()
          this.startEncounter(700);
        }

        if (interactive.entityType === EntityTypes.interactive) {
          this.displayMessage(interactive.properties.message)
        }

        if (interactive.entityType === EntityTypes.npc) {
          this.displayMessage(interactive.getCurrentDialog())
        }

        if (interactive.entityType === EntityTypes.chest) {
          this.handleOpenChest(interactive);
        }

        if (interactive.entityType === EntityTypes.keyItem) {
          interactive.pickup();
        }

        if (interactive.entityType === EntityTypes.door) {
          this.handleOpenDoor(interactive);
        }
      }
    );


    // ===================================
    // Handle Warping
    // ===================================
    this.physics.add.overlap(
      this.casts,
      this.triggers,
      (cast: Cast, trigger: any) => {
        cast.destroy();
        if (
          trigger.properties.type === "trigger" &&
          trigger.properties.warpId) {
          this.events.off("item-acquired", this.acquiredItemCallback);
          const warp = this.warpUtility.getWarp(trigger.properties.warpId)
          this.warpUtility.warpTo(warp.warpDestId);
        }
      }
    );
  }

  protected async handleOpenChest(interactive) {
    const sm = State.getInstance();
    if (interactive.locked) {
      const keyItem = sm.getItemOnPlayer(interactive.unlockItemId);
      if (keyItem) {
        interactive.unlock();
        await this.displayMessage([`You unlock the chest with a ${keyItem.name}`]);
        sm.consumeItem(interactive.unlockItemId);
        await wait(300);
        interactive.openChest();
      } else {
        this.displayMessage(["The chest is locked."])
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
      await this.displayMessage(['The door clicks open!'])
      return;
    }
    await this.displayMessage([`It's locked tight.`])
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

  async acquiredItemCallback({ itemId, id, isKeyItem }) {
    const sm = State.getInstance();
    const item = sm.addItemToContents(itemId);
    sm.setFlag(id, true);
    this.player.controllable.canInput = false;
    await this.displayMessage([`Lo got ${item.name}`]);
    if (isKeyItem) {
      this.sound.play("get-item", { volume: 0.1 });
      await wait(1000)
    }
    await wait(300)
    this.player.controllable.canInput = true;
  }

  displayMessage(message: string[]): Promise<any> {
    return new Promise(resolve => {
      this.scene.setActive(false, this.scene.key);
      this.game.scene.start("DialogScene", {
        callingSceneKey: this.scene.key,
        color: "dialog-white",
        message
      });
      this.scene.setActive(true, "DialogScene").bringToTop("DialogScene");
      const dialog = this.game.scene.getScene("DialogScene");
      dialog.events.on("close-dialog", () => {
        resolve();
      });
    });
  }

  protected startEncounter(enemyPartyId: number) {
    this.input.keyboard.resetKeys();
    this.scene.manager.sleep(this.scene.key);
    this.scene.run('Battle', { key: this.scene.key, enemyPartyId })
  }
}
