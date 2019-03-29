export class Lo extends Phaser.GameObjects.Sprite {
  private currentMap: Phaser.Tilemaps.Tilemap;
  private currentScene: Phaser.Scene;
  private keys: Map<string, Phaser.Input.Keyboard.Key>;
  private isMoving = false;
  private velocityX = 0;
  private velocityY = 0;
  private movementSpeed = 2;
  private target = { x: 0, y: 0 };
  /**
   *
   */
  constructor({ scene, x, y, key, map }) {
    super(scene, x, y, key);
    this.currentScene = scene;
    this.currentMap = map;
    this.initSprite();
    this.currentScene.add.existing(this);
  }
  private getKeys(): Map<string, Phaser.Input.Keyboard.Key> {
    return this.keys;
  }
  private initSprite() {
    this.setOrigin(0.5, 0.5);
    this.setFlipX(false);
    this.keys = new Map([
      ['LEFT', this.addKey('LEFT')],
      ['RIGHT', this.addKey('RIGHT')],
      ['DOWN', this.addKey('DOWN')],
      ['UP', this.addKey('UP')]
    ]);

    this.currentScene.physics.world.enable(this);
  }
  private addKey(key: string): Phaser.Input.Keyboard.Key {
    return this.currentScene.input.keyboard.addKey(key);
  }
  update(): void {
    if (this.isMoving) {
      this.moveToTarget();
    } else {
      this.handleInput();
    }
  }
  private moveToTarget() {
    if (this.x === this.target.x && this.y === this.target.y) {
      this.isMoving = false;
    } else {
      if (this.x !== this.target.x) {
        this.x += this.velocityX;
      }
      if (this.y !== this.target.y) {
        this.y += this.velocityY;
      }
    }
  }
  //Find a cleaner way to do this in the future...
  private handleInput() {
    if (this.keys.get('RIGHT').isDown) {
      this.target = { x: this.x + 16, y: this.y };
      const marker = { x: null, y: null };
      marker.x = Math.floor(this.target.x / 16);
      marker.y = Math.floor(this.target.y / 16);
      
      const tile = this.currentMap.getTileAt(marker.x, marker.y, false, 'background');
      if(!tile.properties['collide']){
        this.isMoving = true;
        this.velocityX = this.movementSpeed;
      }

      // this.x += 1;
      this.setFlipX(false);
    } else if (this.keys.get('LEFT').isDown) {
      this.target = { x: this.x - 16, y: this.y };
      const marker = { x: null, y: null };
      marker.x = Math.floor(this.target.x / 16);
      marker.y = Math.floor(this.target.y / 16);
      const tile = this.currentMap.getTileAt(marker.x, marker.y, false, 'background');
      if(!tile.properties['collide']){
        this.isMoving = true;
        this.velocityX = -this.movementSpeed;
      }

      // this.x -= 1;
      this.setFlipX(true);
    } else if (this.keys.get('DOWN').isDown) {

      
      this.target = { x: this.x, y: this.y + 16 };


      const marker = { x: null, y: null };
      marker.x = Math.floor(this.target.x / 16);
      marker.y = Math.floor(this.target.y / 16);
      const tile = this.currentMap.getTileAt(marker.x, marker.y, false, 'background');
      if(tile.properties && !tile.properties['collide']){
        this.isMoving = true;
        this.velocityY = +this.movementSpeed;
      }
      // this.y += 1;
    } else if (this.keys.get('UP').isDown) {

      this.target = { x: this.x, y: this.y - 16 };
      
      const marker = { x: null, y: null };
      marker.x = Math.floor(this.target.x / 16);
      marker.y = Math.floor(this.target.y / 16);
      const tile = this.currentMap.getTileAt(marker.x, marker.y, false, 'background');
      if(!tile.properties['collide']){
        this.isMoving = true;
        this.velocityY = -this.movementSpeed;
      }
      // this.y -= 1;
    }
  }
}
