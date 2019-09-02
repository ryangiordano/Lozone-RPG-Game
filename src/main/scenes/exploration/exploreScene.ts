import { EntityTypes, WarpTrigger, Spawn } from '../../components/entities/Entity';
import { Cast } from "../../components/entities/Cast";
import { Player } from "../../components/entities/Player";
import { wait } from "../../utility/Utility";
import { State } from "../../utility/state/State";
import { KeyboardControl } from "../../components/UI/Keyboard";
import { WarpUtility } from '../../utility/exploration/Warp';
import { MapObjectFactory } from '../../utility/exploration/ObjectLoader';

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
  private mapObjectFactory: MapObjectFactory;
  constructor(key) {
    super({
      key: key || "Explore"
    });
    this.mapObjectFactory = new MapObjectFactory(this.casts, this);
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
    this.loadObjectsFromTilemap();
    this.setColliders();
    this.setPlayer();
    this.setupCamera();
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
    const dataToLoad = this.mapObjectFactory.getDataToLoad();
    dataToLoad.interactives.forEach(d => this.interactive.add(d))
    dataToLoad.triggers.forEach(t => this.triggers.add(t));
  }

  refreshInteractivesByFlag(flagId) {
    //TODO: Implement this function...;
  }

  private setPlayer() {
    const dropPoint =
      <WarpTrigger>this.triggers.children.entries
        .find(t => t['warpId'] === this.warpDestId) ||
      <Spawn>this.triggers.children.entries
        .find(t => t['entityType'] === EntityTypes.spawn);

    this.player = new Player({
      scene: this,
      x: dropPoint.x,
      y: dropPoint.y,
      key: "lo",
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

  protected setColliders() {
    this.physics.add.overlap(
      this.casts,
      this.interactive,
      async (cast: Cast, interactive: any) => {
        cast.destroy();
        this.player.stop();

        if (interactive.entityType === EntityTypes.bossMonster) {
          await this.displayMessage(interactive.getCurrentDialog())
          //TODO: Fix this static battle trigger...;
          this.startEncounter(interactive.encounterId);
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
        if (trigger.entityType === EntityTypes.warp) {
          this.events.off("item-acquired", this.acquiredItemCallback);
          const warp = this.warpUtility.getWarp(trigger.warpId)
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
      await wait(300)
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
