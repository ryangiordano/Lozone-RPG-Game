import { Chest, KeyItem } from '../../assets/objects/Entity';
import { Cast } from "../../assets/objects/Cast";
import { Player } from "../../assets/objects/Player";
import { NPC } from "../../assets/objects/NPC";
import { Interactive } from "../../assets/objects/Interactive";
import { Directions, wait } from "../../utility/Utility";
import { Trigger } from "../../assets/objects/Trigger";
import { State } from "../../utility/state/State";
import { KeyboardControl } from "../../components/UI/Keyboard";

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
  private warpId: number;
  constructor(key) {
    super({
      key: key || "Explore"
    });
  }
  init(data) {
    // Specify the tileset you want to use based on the data passed to the scene.
    const { map, tileset, warpId } = data;
    this.map = this.make.tilemap({ key: map });
    this.tileset = this.map.addTilesetImage(tileset, tileset, 64, 64, 0, 0, 1);
    if (warpId) {
      this.warpId = warpId;
    }
    this.afterInit(data);
    console.log(State.getInstance())
  }
  protected abstract afterInit(data);
  preload(): void {
    // TODO: Gather these into a map
    this.sound.add("bump");
    this.sound.add("beep");
    this.sound.add("chest");
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
    if (this.warpId) {
      spawn = objects.find(o =>
        o.type === "trigger" &&
        o.properties.find(p => p.name === "warpId").value === this.warpId
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
        const { map, warpId, tileset } = object.properties.reduce((acc, i) => {
          acc[i.name] = i.value;
          return acc;
        }, {});

        if (map && warpId && tileset) {
          this.triggers.add(
            new Trigger({
              scene: this,
              x: object.x + 32,
              y: object.y + 32,
              properties: {
                type: object.type,
                map,
                tileset,
                warpId
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
      //TODO: Query NPC from the DB and populate that way.;
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
      // Handle placing the chest
      // ===================================
      if (object.type === "chest") {
        const itemId = object.properties.find(p => p.name === "itemId");
        const id = object.properties.find(p => p.name === "id");
        const toAdd = new Chest({
          scene: this,
          x: object.x + 32,
          y: object.y + 32,
          map: this.map,
          properties: {
            id: id.value,
            itemId: itemId.value,
            type: "chest"
          }
        });
        if (sm.isFlagged(id.value)) {
          toAdd.setOpen();
        }
        this.interactive.add(toAdd);
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
        if(interactive.properties.type === "npc") {
          this.displayMessage(interactive.getCurrentDialog())

        }
        if (interactive.properties.type === "interactive") {
          this.displayMessage(interactive.properties.message)
        }
        if (interactive.properties.type === "chest") {
          interactive.openChest();
        }
        if (interactive.properties.type === "key-item") {
          interactive.pickup();
        }
      }
    );

    this.physics.add.overlap(
      this.casts,
      this.triggers,
      (cast: Cast, trigger: any) => {
        cast.destroy();
        if (trigger.properties.type === "trigger") {
          if (trigger.properties.warpId && trigger.properties.map) {
            // Because we're starting up the same scene, different map,
            // We have to unsubscribe from events in the current scene.
            this.events.off("item-acquired", this.acquiredItemCallback);
            this.scene.start("House", {
              map: trigger.properties.map, // room
              tileset: trigger.properties.tileset, //room tiles
              warpId: trigger.properties.warpId
            });
          }
        }
      }
    );
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

  async acquiredItemCallback({ itemId, id, isKeyItem}) {
    const sm = State.getInstance();
    const item = sm.addItemToContents(itemId);
    sm.setFlag(id, true);
    this.player.controllable.canInput = false;
    this.displayMessage([`Lo got ${item.name}`]);
    if(isKeyItem){
      this.sound.play("get-key-item", { volume: 0.1 });
      await wait(3000)
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
