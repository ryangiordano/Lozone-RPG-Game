import { TweenFactory } from "./TweenBuilder";

const builder = new TweenFactory();

const _scaleUp = (
  target,
  duration = 100,
  from = 1,
  to = 1.1,
  ease = "Linear"
) =>
  builder
    .createTween(target, duration, 0, ease)
    .scaleY(from, to)
    .scaleX(from, to)
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
    .createTween(target, 0)
    .fadeIn(duration)
    .toY(distance)
    .scaleY(0.1, 1)
    .scaleX(0.1, 1)
    .getConfig();

const boing = (target) =>
  builder.createTween(target, 50, 0).setYoyo().toY(20).getConfig();

const hover = (target) =>
  builder
    .createTween(target, 300, 0)
    .toY(20)
    .setYoyo()
    .setRepeat(-1)
    .getConfig();

const fadeOut = (target) =>
  builder.createTween(target, 300, 500).fadeOut().getConfig();

const fadeIn = (target, duration) =>
  builder.createTween(target, 300, 500).fadeIn(duration).getConfig();

export const scaleUp = (target, scene, dur, ease, onComplete) => {
  const timeline = scene.tweens.createTimeline({
    targets: target,
    ease,
  });
  timeline.add(_scaleUp(target, dur, 0.1, 1, ease));
  timeline.setCallback("onComplete", onComplete);
  return timeline;
};

export const slowScaleUp = (target, scene, onComplete) => {
  const timeline = scene.tweens.createTimeline({
    targets: target,
  });
  timeline.add(scaleFadeIn(target, -40, 300));
  timeline.add(fadeOut(target));
  timeline.setCallback("onComplete", onComplete);
  return timeline;
};

export const scaleUpDown = (target, scene, onComplete) => {
  const timeline = scene.tweens.createTimeline({
    targets: target,
  });
  timeline.add(_scaleUp(target, 100));
  timeline.add(scaleDown(target, 70));
  timeline.setCallback("onComplete", onComplete);
  return timeline;
};

export const textScaleUp = (
  target,
  delay,
  height = -80,
  scene: Phaser.Scene,
  onComplete
) => {
  const timeline = scene.tweens.createTimeline({
    targets: target,
    ease: "Linear",
    loop: false,
    delay,
  });
  timeline.add(scaleFadeIn(target, height));
  timeline.add(boing(target));
  timeline.add(fadeOut(target));
  timeline.setCallback("onComplete", onComplete);
  return timeline;
};

export const playCombatText = (
  textObject: Phaser.GameObjects.Text,
  scene: Phaser.Scene
): Promise<any> => {
  return new Promise((resolve) => {
    const tween = textScaleUp(textObject, 0, -80, scene, () => {
      textObject.destroy();
      resolve();
    });
    tween.play();
  });
};

export const textFadeIn = (
  target,
  delay,
  duration,
  scene: Phaser.Scene,
  onComplete
) => {
  const timeline = scene.tweens.createTimeline({
    targets: target,
    ease: "Linear",
    loop: false,
    delay,
  });
  timeline.add(fadeIn(target, duration));
  timeline.setCallback("onComplete", onComplete);
  return timeline;
};

export const cursorHover = (target, delay, scene: Phaser.Scene, onComplete) => {
  const timeline = scene.tweens.createTimeline({
    targets: target,
    ease: "Linear",
    delay,
  });

  timeline.add(boing(target));
  timeline.add(hover(target));
  return timeline;
};

export const fadeInOur = (target, delay, scene: Phaser.Scene, onComplete) => {
  const timeline = scene.tweens.createTimeline({
    targets: target,
    ease: "Linear",
    delay,
  });

  timeline.add(boing(target));
  timeline.add(hover(target));
  return timeline;
};
