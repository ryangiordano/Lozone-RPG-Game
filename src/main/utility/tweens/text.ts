import { TweenFactory } from "./TweenBuilder";

const builder = new TweenFactory();


const scaleUp = (target, duration = 100) =>
  builder
    .createTween(target, duration, 0)
    .scaleY(1, 1.1)
    .scaleX(1, 1.1)
    .getConfig();

const scaleDown = (target, duration = 100) =>
  builder
    .createTween(target, duration, 0)
    .scaleY(1, 0.1)
    .scaleX(1, 0.1)
    .fadeOut()
    .getConfig();


const scaleFadeIn = (target, distance = -80, duration = 100) =>
  builder
    .createTween(target, duration, 0)
    .fadeIn()
    .toY(distance)
    .scaleY(0.1, 1)
    .scaleX(0.1, 1)
    .getConfig();

const boing = target =>
  builder
    .createTween(target, 50, 0)
    .setYoyo()
    .toY(20)
    .getConfig();

const hover = target =>
  builder
    .createTween(target, 300, 0)
    .toY(20)
    .setYoyo()
    .setRepeat(-1)
    .getConfig();

const fadeOut = target =>
  builder
    .createTween(target, 300, 500)
    .fadeOut()
    .getConfig();

export const slowScaleUp = (target, scene, onComplete) => {
  const timeline = scene.tweens.createTimeline({
    targets: target
  });
  timeline.add(scaleFadeIn(target, -40, 300));
  timeline.add(fadeOut(target));
  timeline.setCallback("onComplete", onComplete);
  return timeline;
};

export const scaleUpDown = (target, scene, onComplete)=>{
  const timeline = scene.tweens.createTimeline({
    targets: target
  });
  timeline.add(scaleUp(target, 100));
  timeline.add(scaleDown(target, 70));
  timeline.setCallback("onComplete", onComplete);
  return timeline;
} 

export const textScaleUp = (target, delay, height=-80, scene: Phaser.Scene, onComplete) => {
  const timeline = scene.tweens.createTimeline({
    targets: target,
    ease: "Linear",
    loop: false,
    delay
  });
  timeline.add(scaleFadeIn(target, height));
  timeline.add(boing(target));
  timeline.add(fadeOut(target));
  timeline.setCallback("onComplete", onComplete);
  return timeline;
};

export const cursorHover = (target, delay, scene: Phaser.Scene, onComplete) => {
  const timeline = scene.tweens.createTimeline({
    targets: target,
    ease: "Linear",
    delay
  });

  timeline.add(boing(target))
  timeline.add(hover(target));
  return timeline;
}