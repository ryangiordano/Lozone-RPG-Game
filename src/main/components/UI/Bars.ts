
export class Bar extends Phaser.GameObjects.Container {
    private barBack: Phaser.GameObjects.Rectangle;
    private barFill: Phaser.GameObjects.Rectangle;
    private barWidth: number = 90;
    private barBorder: Phaser.GameObjects.RenderTexture;
    constructor(scene: Phaser.Scene, position: Coords, private currentValue: number, private maxValue: number, color: number) {
      super(scene, position.x, position.y);
      this.barBack = new Phaser.GameObjects.Rectangle(scene,
        0,
        0, this.barWidth, 7, 0xbfbfbf, .5);
      this.barFill = new Phaser.GameObjects.Rectangle(scene,
        0,
        0, this.barWidth, 7, color, 1);
      this.barFill.width = 0;
      this.barBorder = scene.add.nineslice(
        0,
        0,
        this.barWidth,
        15,
        "bar",
        5
      );
      this.barBorder.setOrigin(.5, .5)
      scene.add.existing(this)
      scene.add.existing(this.barBack);
      scene.add.existing(this.barFill);
      this.add(this.barBack);
      this.add(this.barFill);
      this.bringToTop(this.barFill);
      this.add(this.barBorder)
      this.bringToTop(this.barBorder);
      this.setBar();
    }
    
    setCurrentValue(newValue: number): Promise<any>{
        return new Promise(async resolve=>{
            this.currentValue = Math.max(0, newValue);
            await this.setBar();
            resolve();
        })

    }
    setBar(): Promise<any> {
      return new Promise(resolve => {
        const fill = this.barWidth / (this.maxValue / this.currentValue);
        const tween = this.scene.tweens.add({
          targets: this.barFill,
          duration: 300,
          width: fill,
          onCompleteCallback: () => {
            resolve();
          }
        });
      })
  
    }
  }
  
  export class HpBar extends Bar {
    /**
     * Standard HP bar
     */
    constructor(scene: Phaser.Scene, position: Coords, currentValue: number, maxValue: number) {
      super(scene, position, currentValue, maxValue, 0xEC7171);
  
    }
  }
  
  export class MpBar extends Bar {
    /**
     * Standard HP bar
     */
    constructor(scene: Phaser.Scene, position: Coords, currentValue: number, maxValue: number) {
      super(scene, position, currentValue, maxValue, 0x8DDAD8);
  
    }
  }
  
  export class XpBar extends Bar {
    /**
     * Standard HP bar
     */
    constructor(scene: Phaser.Scene, position: Coords, currentValue: number, maxValue: number) {
      super(scene, position, currentValue, maxValue, 0xD6D252);
  
    }
  }