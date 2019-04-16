export class CreditRoller extends Phaser.GameObjects.Container {
  /**
   * Takes in an array of  credit objects.
   */
  private fadeIn: Phaser.Tweens.Tween;
  private fadeOut: Phaser.Tweens.Tween;
  private showDuration = 3000;
  private creditInterval = 1000;
  constructor(pos: Coords, scene: Phaser.Scene, private credits: any[]) {
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
        //handle completion
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
        //handle completion
        setTimeout(() => {
          const toShowNext = this.nextCredits();
          this.showCredits(toShowNext);
          this.fadeIn.restart();
        }, this.creditInterval);
      }
    });
    //TEST
    this.add(new Phaser.GameObjects.Text(scene, 0, 0, 'HELLO', {
      fontFamily: 'pixel',
      fontSize: '8px',
      fill: '#000000'
    }));
    this.rollCredits();
  }
  showCredits(credits: any[]) {
    this.removeCredits();
    const coords = { x: 0, y: 0 };
    credits.forEach(credit => {
      this.createCredit(credit, coords);
    });
  }
  nextCredits() {
    if (!this.credits.length)
      return [];
    if (this.credits.length && this.credits[0].type === 'heading') {
      return [this.credits[0]];
    }
    const toShow = [];
    const scan = this.credits.slice(0, 3);
    for (let i = 0; i < scan.length; i++) {
      if (scan[i].type === 'heading') {
        break;
      }
      toShow.push(this.credits[i]);
    }
  }
  createCredit(credit: any, coords: Coords) {
    //TODO : Lots of copied/pasted code. Refactor.
    if (credit.type === 'heading') {
      this.add(new Phaser.GameObjects.Text(this.scene, coords.x, coords.y, credit.heading, {
        fontFamily: 'pixel',
        fontSize: '8px',
        fill: '#000000'
      }));
      return;
    }
    this.add(new Phaser.GameObjects.Text(this.scene, coords.x, coords.y, credit.title, {
      fontFamily: 'pixel',
      fontSize: '8px',
      fill: '#000000'
    }));
    coords.y += 10;
    this.add(new Phaser.GameObjects.Text(this.scene, coords.x, coords.y, credit.name, {
      fontFamily: 'pixel',
      fontSize: '8px',
      fill: '#000000'
    }));
  }
  removeCredits() {
    this.removeAll(true);
  }
  rollCredits() {
    this.fadeIn.play(true);
  }
  creditsDone() {
    this.emit('credits-finished');
  }
}
