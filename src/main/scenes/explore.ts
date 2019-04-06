import { Cast } from "../assets/objects/Cast";
import { Player } from "../assets/objects/Player";
import { NPC } from "../assets/objects/NPC";
import { Interactive } from "../assets/objects/Interactive";
import { DialogManager } from "../assets/services/DialogManager";
import { Directions } from "../utility/Utility";
import { Trigger } from "../assets/objects/Trigger";

export class Explore extends Phaser.Scene {
  private map: Phaser.Tilemaps.Tilemap;
  private tileset: Phaser.Tilemaps.Tileset;
  private backgroundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private foregroundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private lo: Player;
  private ryan: NPC;
  private interactive: Phaser.GameObjects.Group;
  private beep: Phaser.Sound.BaseSound;
  private casts: Phaser.GameObjects.Group;
  private dialogManager: DialogManager;
  private triggers: Phaser.GameObjects.Group;
  private warpId: number;
  constructor() {
    super({
      key: "Explore"
    });
  }
  init(data) {
    // Specify the tileset you want to use based on the data passed to the scene.
    const { map, tileset, warpId } = data;
    this.map = this.make.tilemap({ key: map });
    // TODO: Create a utility class to handle this.  Maybe we can cache tilesets/maps.
    
    this.tileset = this.map.addTilesetImage(tileset, tileset, 16, 16, 0, 0, 1);
    if (warpId) {
      this.warpId = warpId;
    }
  }
  preload(): void {
    // TODO: Gather these into a map
    this.sound.add("bump");
    this.sound.add("beep");
  }

  create(): void {
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

    //Game Objects
    this.interactive = this.add.group({
      runChildUpdate: true
    });
    this.casts = this.add.group({
      runChildUpdate: true
    });

    this.triggers = this.add.group({
      runChildUpdate: true
    });

    this.loadObjectsFromTilemap();

    // *****************************************************************
    // COLLIDERS
    // *****************************************************************
    this.physics.add.overlap(
      this.casts,
      this.interactive,
      (cast: Cast, interactive: any) => {
        cast.destroy();
        if (interactive.properties.type === "interactive") {
          this.dialogManager.displayDialog(interactive.properties.message);
          this.lo.controllable.canInput = false;
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
            this.scene.start("Explore", {
              map: trigger.properties.map,// room
              tileset: trigger.properties.tileset, //room tiles
              warpId: trigger.properties.warpId
            });
          }
        }
      }
    );

    this.afterCreate();
  }
  afterCreate() {
    this.dialogManager = new DialogManager(this, () => {
      setTimeout(() => {
        this.lo.controllable.canInput = true;
      }, 200);
    });

    // If there is dialog on screen, cycle throw the text.
    this.input.keyboard.on("keydown", event => {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE) {
        if (this.dialogManager.dialogVisible()) {
          this.dialogManager.handleNextDialog();
        }
      }
    });

    this["updates"].addMultiple([this.lo]);
  }

  update(): void {}

  private loadObjectsFromTilemap(): void {
    const objects = this.map.getObjectLayer("objects").objects as any[];
    let spawn;
    if (this.warpId) {
      spawn = objects.find(
        o => o.type === "trigger" && o.properties.find(p=>p.name==="warpId").value === this.warpId
      );
    }
    if (!spawn) {
      spawn = objects.find(o => o.type === "spawn");
    }
    // TODO: Make this its own abstraction (spawning)
    this.lo = new Player({
      scene: this,
      x: spawn.x + 8,
      y: spawn.y + 8,
      key: "lo",
      map: this.map,
      casts: this.casts
    });

    objects.forEach(object => {
      if (object.type === "interactive") {
        const message = object.properties.find(p => p.name === "message");
        this.interactive.add(
          new Interactive({
            scene: this,
            x: object.x + 8,
            y: object.y + 8,
            properties: {
              type: object.type,
              id: object.id,
              message: message && message.value
            }
          })
        );
      }
      if (object.type === "trigger") {
        const {map, warpId, tileset} = object.properties.reduce((acc, i) => {
          acc[i.name] = i.value;
          return acc;
        }, {});

        if (map && warpId && tileset) {
          this.triggers.add(
            new Trigger({
              scene: this,
              x: object.x + 8,
              y: object.y + 8,
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
              x: object.x + 8,
              y: object.y + 8,
              properties: {
                type: object.type,
                id: object.id
              }
            })
          );
        }
      }
      if (object.type === "npc") {
        const message = object.properties.find(p => p.name === "message");
        const key = object.properties.find(p => p.name === "sprite-key");
        this.interactive.add(
          new NPC(
            {
              scene: this,
              x: object.x + 8,
              y: object.y + 8,
              key: key.value,
              map: this.map,
              casts: this.casts
            },
            message && message.value,
            Directions.up
          )
        );
      }
    });
    this.cameras.main.startFollow(this.lo);
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
  }
}
