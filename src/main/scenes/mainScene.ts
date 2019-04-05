import { Cast } from "./../assets/objects/Cast";
import { Player } from "../assets/objects/Player";
import {NPC} from '../assets/objects/NPC';
import { Interactive } from "../assets/objects/Interactive";
import { DialogManager } from "../assets/services/DialogManager";
import { Directions } from "../utility/Utility";

export class MainScene extends Phaser.Scene {
  private map: Phaser.Tilemaps.Tilemap;
  private tileset: Phaser.Tilemaps.Tileset;
  private backgroundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private foregroundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private lo: Player;
  private ryan: NPC;
  private interactive: Phaser.GameObjects.Group;
  private spawn: Phaser.GameObjects.Group;
  private beep: Phaser.Sound.BaseSound;
  private casts: Phaser.GameObjects.Group;
  private dialogManager: DialogManager;
  constructor() {
    super({
      key: "MainScene"
    });
  }

  preload(): void {
    // TODO: Gather these into a map
    this.sound.add("bump");
    this.sound.add("beep");
  }

  create(): void {
    this.map = this.make.tilemap({ key: "room" });
    this.tileset = this.map.addTilesetImage(
      "room-tiles",
      "room-tiles",
      16,
      16,
      0,
      0,
      1
    );
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
    this.spawn = this.add.group({
      runChildUpdate: true
    });
    this.interactive = this.add.group({
      runChildUpdate: true
    });
    this.casts = this.add.group({
      runChildUpdate: true
    });
    this.interactive = this.add.group({
      runChildUpdate: true
    });

    this.loadObjectsFromTilemap();

    // *****************************************************************
    // COLLIDERS
    // *****************************************************************
    this.physics.add.overlap(
      this.casts,
      this.interactive,
      (cast: Cast, interactiveObj: any) => {
        cast.destroy();
        if (interactiveObj.properties.type === "interactive") {
          this.dialogManager.displayDialog(interactiveObj.properties.message);
          this.lo.controllable.canInput = false;
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

    this['updates'].addMultiple([this.lo]);
  }

  update(): void {
    // Is this really how updates on members of scenes should be handled?
    // this.dialogManager.update();
  }
  private loadObjectsFromTilemap(): void {
    const objects = this.map.getObjectLayer("objects").objects as any[];
    const spawn = objects.find(o => o.type === "spawn" && o.name === "front");

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
      if(object.type ==="npc"){
        const message = object.properties.find(p=>p.name==="message");
        const key = object.properties.find(p=>p.name==="sprite-key");
        this.interactive.add(
          new NPC({
            scene: this,
            x: object.x + 8,
            y: object.y + 8,
            key: key.value,
            map: this.map,
            casts: this.casts
          }, message && message.value, Directions.up)
        )
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
