export class TweenFactory {
  private tweenConfig;
  constructor() {}
  public createTween(target: any, duration: number = 5, delay: number = 0) {
    target.setOrigin(0.5, 0.5);
    this.tweenConfig = {
      targets: [target],
      ease: "Linear",
      duration: duration,
      delay: delay,
      repeat: 0,
      paused: false
    };
    return this;
  }
  public ease(ease: string) {
    this.tweenConfig.ease = ease;
    return this;
  }
  public fadeIn() {
    this.tweenConfig.targets.forEach(target => target.setAlpha(0));
    this.tweenConfig.alpha = {
      getStart: () => 0,
      getEnd: () => 1
    };
    return this;
  }
  public fadeOut() {
    this.tweenConfig.targets.forEach(target => target.setAlpha(1));
    this.tweenConfig.alpha = {
      getStart: () => 1,
      getEnd: () => 0
    };
    return this;
  }
  public color(color: string) {
    this.tweenConfig.color = color;
    return this;
  }
  public toY(distance: number) {
    this.tweenConfig.y =
      distance >= 0 ? `+=${distance}` : `-=${Math.abs(distance)}`;
    return this;
  }
  public toX(distance: number) {
    this.tweenConfig.x =
      distance >= 0 ? `+=${distance}` : `-=${Math.abs(distance)}`;
    return this;
  }
  public scaleY(from: number, to: number) {
    this.tweenConfig.targets.forEach(target => (target.setScaleY = from));
    this.tweenConfig.scaleY = to;
    return this;
  }
  public scaleX(from: number, to: number) {
    this.tweenConfig.targets.forEach(target => (target.setScaleX = from));
    this.tweenConfig.scaleX = to;
    return this;
  }
  public setYoyo() {
    this.tweenConfig.yoyo = true;
    return this;
  }
  public setOnComplete(callback) {
    this.tweenConfig.onComplete = () => callback();
    return this;
  }
  public setRepeat(times: number) {
    this.tweenConfig.repeat = times;
  }
  public getConfig() {
    const tweenConfig = { ...this.tweenConfig };
    this.tweenConfig = {};
    return tweenConfig;
  }
  public build() {
    return (scene: Phaser.Scene) => scene.add.tween(this.getConfig());
  }
}

const builder = new TweenFactory();

const scaleFadeIn = target =>
  builder
    .createTween(target, 100, 0)
    .fadeIn()
    .toY(-80)
    .scaleY(0.1, 1)
    .scaleX(0.1, 1)
    .getConfig();

const boing = target =>
  builder
    .createTween(target, 50, 0)
    .setYoyo()
    .toY(20)
    .getConfig();

const fadeOut = target =>
  builder
    .createTween(target, 300, 500)
    .fadeOut()
    .getConfig();

export const textScaleUp = (target, delay, scene: Phaser.Scene, onComplete) => {
  const timeline = scene.tweens.createTimeline({
    targets: target,
    ease: "Linear",
    loop: false,
    delay
  });
  timeline.add(scaleFadeIn(target));
  timeline.add(boing(target));
  timeline.add(fadeOut(target));
  timeline.setCallback("onComplete", onComplete);
  return timeline;
};
