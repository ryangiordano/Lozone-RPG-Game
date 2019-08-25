import { Chest, KeyItem, LockedDoor } from '../../assets/objects/Entity';
import { Cast } from "../../assets/objects/Cast";
import { Player } from "../../assets/objects/Player";
import { NPC, BossMonster } from '../../assets/objects/NPC';
import { Interactive } from "../../assets/objects/Interactive";
import { Directions, wait } from "../../utility/Utility";
import { Trigger } from "../../assets/objects/Trigger";
import { State } from "../../utility/state/State";
import { KeyboardControl } from "../../components/UI/Keyboard";
import { WarpUtility } from '../../utility/Warp';

export abstract class Explore extends Phaser.Scene {
  private map: Phaser.Tilemaps.Tilemap;
  private tileset: Phaser.Tilemaps.Tileset;
  private backgroundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private foregroundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private interactive: Phaser.GameObjects.Group;
  private casts: Phaser.GameObjects.Group;
  private triggers: Phaser.GameObjects.Group;
  protected keyboardControl: KeyboardControl;
  protected player: Player;
  protected playerIsMoving: boolean = false;
  private warpDestId: number;
  private warpUtility: WarpUtility;
  constructor(key) {
    super({
      key: key || "Explore"
    });
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
    console.log("Preloading")
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
    const objects = this.map.getObjectLayer("objects").objects as any[];
    const sm = State.getInstance();

    // ===================================
    // Spawn the player
    // ===================================
    // TODO: Make this its own abstraction (spawning)
    // Work through this here.
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

    // ===================================
    // Lay Objects down
    // ===================================

    objects.forEach(object => {
      if (object.type === "interactive") {
        const id = object.properties.find(p => p.name === "dialogId").value;
        const message = sm.dialogController.getDialogById(id);
        this.interactive.add(
          new Interactive({
            scene: this,
            x: object.x + 32,
            y: object.y + 32,
            properties: {
              type: object.type,
              id: object.id,
              message: message && message.content
            }
          })
        );
      }
      if (object.type === "trigger") {
        const { warpId } = object.properties.reduce((acc, i) => {
          acc[i.name] = i.value;
          return acc;
        }, {});


        if (warpId) {
          this.triggers.add(
            new Trigger({
              scene: this,
              x: object.x + 32,
              y: object.y + 32,
              properties: {
                type: object.type,
                warpId,
              }
            })
          );
        } else {
          this.triggers.add(
            new Trigger({
              scene: this,
              x: object.x + 32,
              y: object.y + 32,
              properties: {
                type: object.type,
                id: object.id
              }
            })
          );
        }
      }
      // ===================================
      // Handle placing the NPC
      // ===================================
      if (object.type === "npc") {
        const id = object.properties.find(p => p.name === "npcId").value;
        const npc = sm.npcController.getNPCById(id)
        const npcObject = new NPC(
          {
            scene: this,
            x: object.x + 32,
            y: object.y + 32,
            key: npc.spriteKey,
            map: this.map,
            casts: this.casts
          },
          Directions.up,
          npc.dialog
        )
        this.interactive.add(npcObject);
      }

      // ===================================
      // Handle placing the Bossmonster
      // ===================================
      if (object.type === "boss-monster") {
        const id = object.properties.find(p => p.name === "npcId").value;
        const npc = sm.npcController.getNPCById(id)
        console.log(npc.spriteKey)
        const npcObject = new BossMonster(
          {
            scene: this,
            x: object.x + 32,
            y: object.y + 32,
            key: npc.spriteKey,
            map: this.map,
            casts: this.casts
          },
          Directions.up,
          npc.dialog
        )
        this.interactive.add(npcObject);
      }

      // ===================================
      // Handle placing the chest
      // ===================================
      if (object.type === "chest") {
        const itemId = object.properties.find(p => p.name === "itemId");
        const id = object.properties.find(p => p.name === "flagId");
        const locked = object.properties.find(p => p.name === "locked");
        const toAdd = new Chest({
          scene: this,
          x: object.x + 32,
          y: object.y + 32,
          map: this.map,
          properties: {
            id: id.value,
            itemId: itemId.value,
            type: "chest",
          }
        }, locked && 6);
        if (locked && locked.value) {
          toAdd.lock();
        }
        if (sm.isFlagged(id.value)) {
          toAdd.setOpen();
        }
        this.interactive.add(toAdd);
      }

      // ===================================
      // Handle placing locked door.
      // ===================================
      if (object.type === "door") {
        const id = object.properties.find(p => p.name === "flagId").value;
        if (!sm.isFlagged(id)) {
          const toAdd = new LockedDoor({
            scene: this,
            x: object.x + 32,
            y: object.y + 32,
            map: this.map,
            properties: {
              id: id,
              type: "door",
            }
          }, 7);
          this.interactive.add(toAdd);
        }
      }
      // ===================================
      // Handle placing key item
      // ===================================
      if (object.type === "key-item") {
        const itemId = object.properties.find(p => p.name === "itemId").value;
        const id = object.properties.find(p => p.name === "flagId").value;
        const item = sm.getItem(itemId);
        if (!sm.isFlagged(id)) {
          const toAdd = new KeyItem({
            scene: this,
            x: object.x + 32,
            y: object.y + 32,
            map: this.map,
            properties: {
              id: id,
              itemId: itemId,
              type: "key-item",
              spriteKey: item.spriteKey,
              frame: item.frame
            }
          });
          this.interactive.add(toAdd);
        }
      }
    });

    this.setupCamera();
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
      (cast: Cast, interactive: any) => {
        cast.destroy();
        this.player.stop();
        if (interactive.properties.type === "npc") {
          this.displayMessage(interactive.getCurrentDialog())

        }
        if (interactive.properties.type === "interactive") {
          this.displayMessage(interactive.properties.message)
        }
        if (interactive.properties.type === "chest") {
          this.handleOpenChest(interactive);
        }
        if (interactive.properties.type === "key-item") {
          interactive.pickup();
        }
        if (interactive.properties.type === 'door') {
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

  /**
   * 
   * @param message
   */
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
}
