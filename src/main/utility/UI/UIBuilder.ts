export class UIBuilder {
  //I want to build a dialog panel
  /**
   *
   */
  private tileMap: any;
  constructor(private scene: Phaser.Scene) {
    this.tileMap = this.scene.game.textures.list['dialog-tiles'];
    scene.add.nineslice(0,0,100,100,'dialog',5);
  }
  buildPanel() {
    const panel = new DialogPanel(
      this.tileMap,
      { x: 3, y: 3 },
      { x: 0, y: 0 }
    );
    
    debugger;
  }
}

class DialogPanel {
  /**
   *
   */
  private sprites: Phaser.GameObjects.Sprite[];
  constructor(
    private frames: any,
    private dimensions: Coords,
    private position: Coords
  ) {
    this.constructPanel();
  }
  constructPanel() {
    for (let row = 0; row < this.dimensions.y; row++) {
      for (let col = 0; col < this.dimensions.x; col++) {
        if (row === 0 && col === 0) {
          //top left
        } else if (row === this.dimensions.y - 1 && col === 0) {
          //bottom left
        } else if (row === 0 && col === this.dimensions.y - 1) {
          // top right
        } else if (row === this.dimensions.y - 1 && col === this.dimensions.x - 1) {
          // bottom right
        } else if (row === 0 && col > 0 && col < this.dimensions.x - 1) {
          //top middle
        } else if (row > 0 && row < this.dimensions.y - 1 && col === 0) {
          // left side
        } else if (row > 0 && row < this.dimensions.y - 1 && col === this.dimensions.x - 1) {
          //right side
        } else if (row > 0 && row < this.dimensions.y - 1 && col > 0 && col < this.dimensions.y - 1) {
          //middle
        } else if (row === this.dimensions.y-1 && col > 0 && col <this.dimensions.x-1){
          //bottom middle
        }

      }
    }
  }
  hidePanel() {
    this.sprites.forEach(sprite => (sprite.visible = false));
  }
  showPanel() {
    this.sprites.forEach(sprite => (sprite.visible = true));
  }
}
