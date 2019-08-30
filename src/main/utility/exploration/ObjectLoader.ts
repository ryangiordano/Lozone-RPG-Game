import { Explore } from '../../scenes/exploration/exploreScene';
import { State } from '../state/State';
import { Player } from '../../assets/objects/Player';
import { Interactive } from '../../assets/objects/Interactive';
import { Trigger } from '../../assets/objects/Trigger';
import { NPC, BossMonster } from '../../assets/objects/NPC';
import { Directions } from '../Utility';
import { Chest, LockedDoor, KeyItem, EntityTypes } from '../../assets/objects/Entity';
import { Cast } from '../../assets/objects/Cast';


interface MapObject {

}

interface ExploreData {
    interactives: Phaser.GameObjects.Sprite[]
    triggers: Phaser.GameObjects.Sprite[]
}

export class MapObjectFactory {
    /**
     * Handles loading objects on the Explore scenes.
     */
    private stateManager: State;
    constructor(private casts: Phaser.GameObjects.Group, private scene: Explore) {
        //TODO: Use events to refactor having to pass casts down from scene to every npc;
        this.stateManager = State.getInstance();
    }

    public getDataToLoad(): ExploreData {
        const exploreData: ExploreData = {
            interactives: [],
            triggers: []
        }
        const objects = this.scene.map.getObjectLayer("objects").objects as any[];
        // ===================================
        // Lay Objects down
        // ===================================

        objects.forEach(object => {
            if (object.type === "interactive") {
                const interactive = this.createInteractive(object);
                exploreData.interactives.push(interactive);
            }
            if (object.type === "trigger") {
                const trigger = this.createTrigger(object);
                exploreData.triggers.push(trigger);
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
                keyItem && exploreData.interactives.push(keyItem);
            }
        });
        return exploreData;
    }

    private hasProperty(name, properties): boolean {
        const property = properties.find(p => p.name === name);
        return !!property;
    }

    private getObjectPropertyByName(name, properties) {
        if (!this.hasProperty(name, properties)) {
            return false;
        }
        const property = properties.find(p => p.name === name);
        return property.value;
    }

    private createInteractive(object) {
        const id = this.getObjectPropertyByName('dialogId', object.properties)
        const message = this.stateManager.dialogController.getDialogById(id);
        return new Interactive({
            scene: this.scene,
            x: object.x + 32,
            y: object.y + 32,
            properties: {
                type: object.type,
                id: object.id,
                message: message && message.content
            }
        });
    }

    //TODO: Revisit whether we need two differe kinds of triggers
    private createTrigger(object) {
        const triggerConfig = {
            scene: this.scene,
            x: object.x + 32,
            y: object.y + 32,
            properties: {
                type: EntityTypes.trigger
            }
        };
        if (this.hasProperty('warpId', object.properties)) {
            const warpId = this.getObjectPropertyByName('warpId', object.properties)
            triggerConfig.properties['warpId'] = warpId;
        } else {
            triggerConfig.properties['id'] = object.id;
        }
        return new Trigger(triggerConfig);
    }

    private createNpc(object) {
        const id = this.getObjectPropertyByName('npcId', object.properties)
        const npc = this.stateManager.npcController.getNPCById(id)
        const npcObject = new NPC(
            {
                scene: this.scene,
                key: npc.spriteKey,
                map: this.scene.map,
                casts: this.casts,
            },
            Directions.up,
            npc.dialog,
            npc.placement
        )
        return npcObject;
    }

    private createBossMonster(object) {
        const id = this.getObjectPropertyByName('npcId', object.properties);
        const triggerBattleId = this.getObjectPropertyByName('triggerBattle', object.properties);
        const npc = this.stateManager.npcController.getNPCById(id);
        const npcObject = new BossMonster(
            {
                scene: this.scene,
                key: npc.spriteKey,
                map: this.scene.map,
                casts: this.casts
            },
            triggerBattleId,
            Directions.up,
            npc.dialog,
            npc.placement
        )
        return npcObject;
    }

    private createChest(object) {
        const itemId = this.getObjectPropertyByName('itemId', object.properties);
        const flagId = this.getObjectPropertyByName('flagId', object.properties);
        const locked = this.getObjectPropertyByName('locked', object.properties);
        const chest = new Chest({
            scene: this.scene,
            x: object.x + 32,
            y: object.y + 32,
            map: this.scene.map,
            properties: {
                id: flagId,
                itemId: itemId,
                type: EntityTypes.chest,
            }
        }, locked && 6);
        if (this.stateManager.isFlagged(flagId)) {
            chest.setOpen();
        } else if (locked) {
            chest.lock();
        }

        return chest;
    }

    private createDoor(object) {
        const flagId = this.getObjectPropertyByName("flagId", object.properties);
        if (!this.stateManager.isFlagged(flagId)) {
            const door = new LockedDoor({
                scene: this.scene,
                x: object.x + 32,
                y: object.y + 32,
                map: this.scene.map,
                properties: {
                    id: flagId,
                    type: EntityTypes.door,
                }
            }, 7);
            return door;
        }
        return false;
    }

    private createKeyItem(object) {
        const itemId = this.getObjectPropertyByName('itemId', object.properties);
        const flagId = this.getObjectPropertyByName("flagId", object.properties);
        const item = this.stateManager.getItem(itemId);

        const alreadyCollected = this.stateManager.isFlagged(flagId);
        const hasPlacementFlag = this.hasProperty("placementFlag", object.properties)
        const placementFlagId = this.getObjectPropertyByName("placementFlag", object.properties);
        const notYetFlagggedToPlace = !this.stateManager.isFlagged(placementFlagId)
        if ((hasPlacementFlag && notYetFlagggedToPlace) || alreadyCollected) {
            return false;
        }
        const keyItem = new KeyItem({
            scene: this.scene,
            x: object.x + 32,
            y: object.y + 32,
            map: this.scene.map,
            properties: {
                id: flagId,
                itemId: itemId,
                type: EntityTypes.keyItem,
                spriteKey: item.spriteKey,
                frame: item.frame
            }
        });
        return keyItem;
    }
}