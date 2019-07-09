import { TweenFactory } from "./TweenBuilder";

const builder = new TweenFactory();

const scaleFadeIn = (target, duration=100) =>
  builder
    .createTween(target, duration, 0)
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


export const slowScaleUp = (target, scene, onComplete)=>{
  const timeline = scene.tweens.createTimeline({
    targets: target
  });
  timeline.add(scaleFadeIn(target, 300))
  timeline.add(fadeOut(target))
  timeline.setCallback("onComplete", onComplete);
  return timeline.
}
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
