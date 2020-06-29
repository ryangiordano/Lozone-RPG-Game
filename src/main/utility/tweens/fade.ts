export const makeFadeIn = (
  target,
  duration: number,
  scene: Phaser.Scene,
  onComplete?: Function,
  toAlpha = 1
) => {
  return scene.add.tween({
    targets: [target],
    ease: "Sine.easeInOut",
    duration: duration,
    delay: 0,
    paused: true,
    alpha: {
      getStart: () => 0,
      getEnd: () => toAlpha,
    },
    onComplete: () => {
      onComplete ? onComplete() : null;
    },
  });
};
export const makeFadeOut = (
  target,
  duration: number,
  scene: Phaser.Scene,
  onComplete?: Function,
  fromAlpha = 1
) => {
  return scene.add.tween({
    targets: [target],
    ease: "Sine.easeInOut",
    duration: duration,
    delay: 0,
    paused: true,
    alpha: {
      getStart: () => fromAlpha,
      getEnd: () => 0,
    },
    onComplete: () => {
      onComplete ? onComplete() : null;
    },
  });
};
