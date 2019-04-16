import { Chest } from '../assets/objects/Chest';
import { Cast } from '../assets/objects/Cast';
import { Player } from '../assets/objects/Player';
import { NPC } from '../assets/objects/NPC';
import { Interactive } from '../assets/objects/Interactive';
import { DialogManager } from '../utility/Dialog';
import { Directions } from '../utility/Utility';
import { Trigger } from '../assets/objects/Trigger';
import { StateManager } from '../utility/state/StateManager';

export class Explore extends Phaser.Scene {
  private map: Phaser.Tilemaps.Tilemap;
  private tileset: Phaser.Tilemaps.Tileset;
  private backgroundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private foregroundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private interactive: Phaser.GameObjects.Group;
  private casts: Phaser.GameObjects.Group;
  private triggers: Phaser.GameObjects.Group;
  protected player: Player;
  protected dialogManager: DialogManager;
  private warpId: number;
  constructor(key) {
    super({
      key: key || 'Explore'
    });
  }
  init(data) {
    // Specify the tileset you want to use based on the data passed to the scene.
    const { map, tileset, warpId } = data;
    this.map = this.make.tilemap({ key: map });
    this.tileset = this.map.addTilesetImage(tileset, tileset, 16, 16, 0, 0, 1);
    if (warpId) {
      this.warpId = warpId;
    }
  }
  preload(): void {
    // TODO: Gather these into a map
    this.sound.add('bump');
    this.sound.add('beep');
    this.sound.add('chest');
  }
  create(): void {
    this.setGroups();
    this.setMapLayers();
    this.loadObjectsFromTilemap();
    this.setColliders();
    this.setEvents();
    this.dialogManager = new DialogManager(this, () => {
      //TODO: Refactor the logic controlling time before relinquishing control back to player
      // After a dialog is closed.
      setTimeout(() => {
        this.player.controllable.canInput = true;
      }, 200);
    });
    this['updates'].addMultiple([this.player]);
    this.afterCreated();
  }
  protected afterCreated(){

  };
  protected setEvents() {
    this.input.keyboard.on('keydown', event => {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE) {
        // If there is dialog on screen, cycle through the text.
        if (this.dialogManager.dialogVisible()) {
          this.dialogManager.handleNextDialog();
        }
      }
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.Z) {
        this.scene.setActive(false, this.scene.key)
        this.game.scene.start('MenuScene', {callingSceneKey: this.scene.key});
        this.scene.setActive(true, 'MenuScene').bringToTop('MenuScene');
      }
    });
    this.events.on('item-acquired', this.acquiredItemCallback, this);
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
    const objects = this.map.getObjectLayer('objects').objects as any[];
    const sm = StateManager.getInstance();
    let spawn;
    if (this.warpId) {
      spawn = objects.find(
        o =>
          o.type === 'trigger' &&
          o.properties.find(p => p.name === 'warpId').value === this.warpId
      );
    }
    if (!spawn) {
      spawn = objects.find(o => o.type === 'spawn');
    }
    // TODO: Make this its own abstraction (spawning)
    this.player = new Player({
      scene: this,
      x: spawn.x + 8,
      y: spawn.y + 8,
      key: 'lo',
      map: this.map,
      casts: this.casts
    });

    objects.forEach(object => {
      if (object.type === 'interactive') {
        const id = object.properties.find(p => p.name === 'dialogId').value;
        const message = sm.dialogRepository.getDialogById(id);
        this.interactive.add(
          new Interactive({
            scene: this,
            x: object.x + 8,
            y: object.y + 8,
            properties: {
              type: object.type,
              id: object.id,
              message: message && message.content
            }
          })
        );
      }
      if (object.type === 'trigger') {
        const { map, warpId, tileset } = object.properties.reduce((acc, i) => {
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
      if (object.type === 'npc') {
        const id = object.properties.find(p => p.name === 'dialogId').value;
        const message = sm.dialogRepository.getDialogById(id);
        const key = object.properties.find(p => p.name === 'sprite-key');
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
            message && message.content,
            Directions.up
          )
        );
      }
      if (object.type === 'chest') {
        const itemId = object.properties.find(p => p.name === 'itemId');
        const id = object.properties.find(p => p.name === 'id');

        const toAdd = new Chest({
          scene: this,
          x: object.x + 8,
          y: object.y + 8,
          map: this.map,
          properties: {
            id: id,
            itemId: itemId.value,
            type: 'chest'
          }
        });
        if (sm.isFlagged('chests', id)) {
          toAdd.setOpen();
        }
        this.interactive.add(toAdd);
      }
    });
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
        if (interactive.properties.type === 'interactive') {
          // TODO: Get this from the sm.dialogRepository
          this.dialogManager.displayDialog(interactive.properties.message);
          this.player.controllable.canInput = false;
        }
        if (interactive.properties.type === 'chest') {
          interactive.openChest();
        }
      }
    );

    this.physics.add.overlap(
      this.casts,
      this.triggers,
      (cast: Cast, trigger: any) => {
        cast.destroy();
        if (trigger.properties.type === 'trigger') {
          if (trigger.properties.warpId && trigger.properties.map) {
            // Because we're starting up the same scene, different map, 
            // We have to unsubscribe from events in the current scene.
            this.events.off('item-acquired', this.acquiredItemCallback)
            this.scene.start('House', {
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
      'background',
      this.tileset
    );
    this.foregroundLayer = this.map.createStaticLayer(
      'foreground',
      this.tileset
    );
    this.backgroundLayer.setName('background');
    this.foregroundLayer.setName('foreground');
  }

  acquiredItemCallback({ itemId, id }) {
    const sm = StateManager.getInstance();
    const item = sm.itemRepository.addItemToPlayerContents(itemId);
    sm.flags.get('chests').setFlag(id, true);
    this.player.controllable.canInput = false;
    setTimeout(() => {
      this.dialogManager.displayDialog([`Lo got ${item.name}`]);
    }, 300);
  }
}
