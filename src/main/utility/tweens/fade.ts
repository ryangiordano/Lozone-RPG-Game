export const makeFadeIn = (target, duration: number, scene: Phaser.Scene, onComplete?: Function) => {
  return scene.add.tween({
    targets: [target],
    ease: 'Sine.easeInOut',
    duration: duration,
    delay: 0,
    paused: true,
    alpha: {
      getStart: () => 0,
      getEnd: () => 1
    },
    onComplete: () => {
      onComplete ? onComplete() : null;
    }
  })
}
export const makeFadeOut = (target, duration: number, scene: Phaser.Scene, onComplete?: Function) => {
  return scene.add.tween({
    targets: [target],
    ease: 'Sine.easeInOut',
    duration: duration,
    delay: 0,
    paused: true,
    alpha: {
      getStart: () => 1,
      getEnd: () => 0
    },
    onComplete: () => {
      onComplete ? onComplete() : null;
    }
  })
}