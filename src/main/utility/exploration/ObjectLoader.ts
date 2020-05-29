import { Explore } from "../../scenes/exploration/exploreScene";
import { State } from "../state/State";
import { Interactive } from "../../components/entities/Interactive";
import { NPC, BossMonster } from "../../components/entities/NPC";
import { Directions, getObjectPropertyByName, hasProperty } from "../Utility";
import {
  Chest,
  LockedDoor,
  KeyItem,
  EntityTypes,
  WarpTrigger,
  Spawn,
  Warp,
} from "../../components/entities/Entity";

interface MapObject {}

interface ExploreData {
  interactives: Phaser.GameObjects.Sprite[];
}

export class MapObjectFactory {
  /**
   * Handles loading objects on the Explore scenes.
   */
  private stateManager: State;
  constructor(private scene: Explore) {
    //TODO: Use events to refactor having to pass casts down from scene to every npc;
    this.stateManager = State.getInstance();
  }

  public getDataToLoad(): ExploreData {
    const exploreData: ExploreData = {
      interactives: [],
    };
    const objects = this.scene.map.getObjectLayer("objects").objects as any[];
    // ===================================
    // Lay Objects down
    // ===================================

    objects.forEach((object) => {
      if (object.type === "interactive") {
        const interactive = this.createInteractive(object);
        exploreData.interactives.push(interactive);
      }
      if (object.type === "spawn") {
        const spawn = this.createSpawn(object);
        exploreData.interactives.push(spawn);
      }

      if (object.type === "warp" || object.type === "warp-tile") {
        const warp = this.createWarp(object, object.type !== "warp-tile");
        exploreData.interactives.push(warp);
      }

      // ===================================
      // Handle placing the NPC
      // ===================================
      if (object.type === "npc") {
        const npc = this.createNpc(object);
        exploreData.interactives.push(npc);
      }

      // ===================================
      // Handle placing the Bossmonster
      // ===================================
      if (object.type === "boss-monster") {
        const bossMonster = this.createBossMonster(object);
        exploreData.interactives.push(bossMonster);
      }

      // ===================================
      // Handle placing the chest
      // ===================================
      if (object.type === "chest") {
        const chest = this.createChest(object);
        exploreData.interactives.push(chest);
      }

      // ===================================
      // Handle placing locked door.
      // ===================================
      if (object.type === "door") {
        const door = this.createDoor(object);
        door && exploreData.interactives.push(door);
      }
      // ===================================
      // Handle placing key item
      // ===================================
      if (object.type === "key-item") {
        const keyItem = this.createKeyItem(object);
        exploreData.interactives.push(keyItem);
      }
    });
    return exploreData;
  }

  private createInteractive(object) {
    const id = getObjectPropertyByName("dialogId", object.properties);
    const message = this.stateManager.dialogController.getDialogById(id);
    return new Interactive({
      scene: this.scene,
      x: object.x + 32,
      y: object.y + 32,
      properties: {
        type: object.type,
        id: object.id,
        message: message && message.content,
      },
    });
  }

  private createWarp(object, triggerOnly) {
    const warpId = getObjectPropertyByName("warpId", object.properties);
    const flagId = getObjectPropertyByName("flagId", object.properties);
    const placementFlagId = getObjectPropertyByName(
      "placementFlag",
      object.properties
    );
    const properties = {
      flagId: flagId,
      type: EntityTypes.keyItem,
    };
    if (placementFlagId) {
      properties["placementFlag"] = placementFlagId;
    }
    const warpConfig = {
      scene: this.scene,
      x: object.x + 32,
      y: object.y + 32,
      warpId,
      key: null,
      properties,
    };

    const alreadyFlagged = this.stateManager.isFlagged(flagId);
    const hasPlacementFlag = hasProperty("placementFlag", object.properties);

    const notYetFlagggedToPlace = !this.stateManager.isFlagged(placementFlagId);
    const unPlaced =
      (hasPlacementFlag && notYetFlagggedToPlace) || alreadyFlagged;

    const warp = triggerOnly
      ? new WarpTrigger(warpConfig)
      : new Warp(warpConfig);
    warp.setPlaced(!unPlaced);
    return warp;
  }

  private createSpawn(object) {
    const spawnConfig = {
      scene: this.scene,
      x: object.x + 32,
      y: object.y + 32,
    };
    return new Spawn(spawnConfig);
  }

  private createTrigger(object) {
    throw new Error("Not Yet Implemented");
  }

  private createNpc(object) {
    const id = getObjectPropertyByName("npcId", object.properties);
    const npc = this.stateManager.npcController.getNPCById(id);
    const npcObject = new NPC(
      {
        scene: this.scene,
        key: npc.spriteKey,
      },
      Directions.up,
      npc.dialog,
      npc.placement
    );
    return npcObject;
  }

  private createBossMonster(object) {
    const id = getObjectPropertyByName("npcId", object.properties);
    const triggerBattleId = getObjectPropertyByName(
      "triggerBattle",
      object.properties
    );
    const npc = this.stateManager.npcController.getNPCById(id);
    const npcObject = new BossMonster(
      {
        scene: this.scene,
        key: npc.spriteKey,
      },
      triggerBattleId,
      Directions.up,
      npc.dialog,
      npc.placement
    );
    return npcObject;
  }

  private createChest(object) {
    const itemId = getObjectPropertyByName("itemId", object.properties);
    const flagId = getObjectPropertyByName("flagId", object.properties);
    const locked = getObjectPropertyByName("locked", object.properties);
    const chest = new Chest(
      {
        scene: this.scene,
        x: object.x + 32,
        y: object.y + 32,
        properties: {
          id: flagId,
          itemId: itemId,
          type: EntityTypes.chest,
        },
      },
      locked && 6
    );
    if (this.stateManager.isFlagged(flagId)) {
      chest.setOpen();
    } else if (locked) {
      chest.lock();
    }

    return chest;
  }

  private createDoor(object) {
    const flagId = getObjectPropertyByName("flagId", object.properties);
    const keyItem = getObjectPropertyByName("keyItem", object.properties);
    const lockMessage = getObjectPropertyByName(
      "lockMessage",
      object.properties
    );
    const unlockMessage = getObjectPropertyByName(
      "unlockMessage",
      object.properties
    );
    if (!this.stateManager.isFlagged(flagId)) {
      const door = new LockedDoor(
        {
          scene: this.scene,
          x: object.x + 32,
          y: object.y + 32,
          map: this.scene.map,
          properties: {
            id: flagId,
            type: EntityTypes.door,
          },
        },
        keyItem || 7,
        lockMessage || object.lockMessage,
        unlockMessage || object.unlockMessage
      );
      return door;
    }
    return false;
  }

  private createKeyItem(object) {
    const itemId = getObjectPropertyByName("itemId", object.properties);
    const flagId = getObjectPropertyByName("flagId", object.properties);
    const item = this.stateManager.getItem(itemId);

    const alreadyCollected = this.stateManager.isFlagged(flagId);
    const hasPlacementFlag = hasProperty("placementFlag", object.properties);
    const placementFlagId = getObjectPropertyByName(
      "placementFlag",
      object.properties
    );
    const notYetFlagggedToPlace = !this.stateManager.isFlagged(placementFlagId);
    const unPlaced =
      (hasPlacementFlag && notYetFlagggedToPlace) || alreadyCollected;

    const properties = {
      flagId: flagId,
      itemId: itemId,
      type: EntityTypes.keyItem,
      spriteKey: item.spriteKey,
      frame: item.frame,
    };

    if (placementFlagId) {
      properties["placementFlag"] = placementFlagId;
    }
    const keyItem = new KeyItem({
      scene: this.scene,
      x: object.x + 32,
      y: object.y + 32,
      properties,
    });
    keyItem.setPlaced(!unPlaced);
    return keyItem;
  }
}
