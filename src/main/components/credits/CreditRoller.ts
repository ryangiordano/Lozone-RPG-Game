export class CreditRoller extends Phaser.GameObjects.Container {
  /**
   * Takes in an array of  credit objects.
   */
  public fadeIn: Phaser.Tweens.Tween;
  public fadeOut: Phaser.Tweens.Tween;
  private showDuration = 7000;
  // private showDuration = 300;
  private creditInterval = 1500;
  // private creditInterval = 200;
  constructor(pos: Coords, scene: Phaser.Scene, private credits: any[], private creditsFinishedCallback: Function) {
    super(scene, pos.x, pos.y);
    this.alpha = 0;
    this.fadeIn = scene.add.tween({
      targets: [this],
      ease: 'Sine.easeInOut',
      duration: 1000,
      delay: 0,
      paused: true,
      alpha: {
        getStart: () => 0,
        getEnd: () => 1
      },
      onComplete: () => {
        setTimeout(() => {
          this.fadeOut.restart();
        }, this.showDuration);
      }
    });
    this.fadeOut = scene.add.tween({
      targets: [this],
      ease: 'Sine.easeInOut',
      duration: 1000,
      delay: 0,
      paused: true,
      alpha: {
        getStart: () => 1,
        getEnd: () => 0
      },
      onComplete: () => {
        setTimeout(() => {
          if (!this.credits.length) {
            this.creditsFinishedCallback();
            return;
          }
          const toShowNext = this.nextCredits();
          this.showCredits(toShowNext);
          this.fadeIn.restart();
        }, this.creditInterval);
      }
    });
  }
  showCredits(credits: any[]) {
    this.removeCredits();
    const coords = { x: 5, y: 5 };
    credits.forEach(credit => {
      this.createCredit(credit, coords);
    });
  }
  nextCredits() {
    if (this.credits.length && this.credits[0].type === 'heading') {
      return [this.credits.shift()];
    }
    const toShow = [];
    const scan = this.credits.slice(0, 4);
    for (let i = 0; i < scan.length; i++) {
      if (scan[i].type === 'heading') {
        break;
      }
      toShow.push(this.credits.shift());
    }
    return toShow;
  }
  createCredit(credit: any, coords: Coords) {
    //TODO : Lots of copied/pasted code. Refactor.
    if (credit.type === 'heading') {
      this.add(new Phaser.GameObjects.Text(this.scene, 0, <number>this.scene.game.config.height / 3, credit.heading, {
        fontFamily: 'pixel',
        fontSize: '8px',
        fill: '#000000',
        align: 'center',
        padding: 2,
        wordWrap: { width: <number>this.scene.game.config.width, useAdvancedWrap: true }
      }));
      return;
    }
    this.add(new Phaser.GameObjects.Text(this.scene, coords.x, coords.y, credit.title, {
      fontFamily: 'pixel',
      fontSize: '8px',
      padding: 2,
      fill: '#000000'
    }));
    coords.y += 10;
    this.add(new Phaser.GameObjects.Text(this.scene, coords.x, coords.y, credit.name, {
      padding: 2,
      fontFamily: 'pixel',
      fontSize: '10px',
      fill: '#000000'
    }));
    coords.y += 16;

  }
  removeCredits() {
    if (this.list.length) {
      this.removeAll(true);
    }
  }
  rollCredits() {
    this.fadeOut.play(true);
  }
  creditsDone() {
    this.emit('credits-finished');
  }
}
