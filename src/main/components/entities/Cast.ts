import { Entity } from "./Entity";

export enum CastType {
  pressure,
  reach
}

export interface CastData {
  castedOn: Entity
  caster: Entity
}

export class Cast extends Phaser.GameObjects.Sprite {
  private currentScene: Phaser.Scene;
  public castType: CastType;
  public caster: Entity;
  constructor(scene: Phaser.Scene, coords: Coords, caster: Entity, castType?: CastType) {
    super(scene, coords.x, coords.y, null);
    this.castType = castType || CastType.reach;
    this.currentScene = scene;
    this.currentScene.add.existing(this);
    this.initSprite();
    this.displayWidth = 8;
    this.displayHeight = 8;
    this.visible = false;
    this.caster = caster;
  }
  private initSprite() {
    this.setOrigin(0.5, 0.5);
    setTimeout(() => {
      this.emit('resolve', { castedOn: null, caster: this.caster })
      this.destroy();
    }, 200)
    this.currentScene.physics.world.enable(this);
  }
}
