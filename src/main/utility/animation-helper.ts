/**
 * Configs taken from official Phaser library code and edited
 *
 * AnimationConfig
 * {string}           [key] - The key that the animation will be associated with. i.e. sprite.animations.play(key)
 * {AnimationFrameConfig[]} [frames] - An object containing data used to generate the frames for the animation
 * {string}           [defaultTextureKey=null] - The key of the texture all frames of the animation will use. Can be overridden on a per frame basis.
 * {integer}          [frameRate] - The frame rate of playback in frames per second (default 24 if duration is null)
 * {integer}          [duration] - How long the animation should play for in milliseconds. If not given its derived from frameRate.
 * {boolean}          [skipMissedFrames=true] - Skip frames if the time lags, or always advanced anyway?
 * {integer}          [delay=0] - Delay before starting playback. Value given in milliseconds.
 * {integer}          [repeat=0] - Number of times to repeat the animation (-1 for infinity)
 * {integer}          [repeatDelay=0] - Delay before the animation repeats. Value given in milliseconds.
 * {boolean}          [yoyo=false] - Should the animation yoyo? (reverse back down to the start) before repeating?
 * {boolean}          [showOnStart=false] - Should sprite.visible = true when the animation starts to play?
 * {boolean}          [hideOnComplete=false] - Should sprite.visible = false when the animation finishes?
 *
 * AnimationFrameConfig
 * {string}           key - The key that the animation will be associated with. i.e. sprite.animations.play(key)
 * {(string|number)}  frame - [description]
 * {number}           [duration=0] - [description]
 * {boolean}          [visible] - [description]
 *
 * GenerateFrameNamesConfig
 * {string}           [prefix=''] - [description]
 * {integer}          [start=0] - [description]
 * {integer}          [end=0] - [description]
 * {string}           [suffix=''] - [description]
 * {integer}          [zeroPad=0] - [description]
 * {boolean}          [frames=false] - [description]
 *
 * GenerateFrameNumbersConfig
 * {integer}          [start=0] - [At which frame the animation starts]
 * {integer}          [end=-1] - [At which frame the animation stops]
 * {boolean}          [first=false] - [description]
 * {boolean}          [frames=false] - [description]
 */

/**
 * This is a helper class for your game animations.
 *
 * There is a easier way to load animations from JSON:
 * https://labs.phaser.io/edit.html?src=src\animation\from%20json.js
 *
 * The only problem with that approach is, that you can not use
 * generateFrameNames and generateFrameNumbers and with that not load
 * your frames from your atlas.
 *
 * The class needs a scene from you game to be able to create the animations.
 * Since the Animation Manager is global, any scene from your game is okay.
 * The class also needs the animation data to be able to create the animations.
 * We load a JSON upfront and get the data from the global cache.
 * @param scene [Any scene from your game]
 * @param data  [Animation data from the cache, loaded from JSON]
 */

interface AnimationData {
  key: string,
  frames: Frame,
  repeat: number,
  frameRate: number,
  defaultTextureKey,
  duration,
  skipMissedFrames,
  delay,
  repeatDelay,
  yoyo,
  showOnStart,
  hideOnComplete,
}

enum GenerationTypes {
  generateFrameNumbers,
  generateFrameNames,
  default
}

interface Frame {
  typeOfGeneration: GenerationTypes,
  key: string,
  frames: any,
  prefix?: string,
  start?: number,
  end?: number,
  suffix?: string,
  zeroPad?: number,
  first?: boolean

}
export class AnimationHelper {
  private scene: Phaser.Scene;
  private animationData: any;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // If we have spritesheets with similar animation states, we can create an animation
  // key it uniquely for each spritesheet.
  public createGenericGameAnimations(keyList: string[], animationData: AnimationData[]) {
    keyList.forEach(key => {
      const keyedAnimationData = animationData.map(d => {
        const copy = { ...d }
        copy.frames.key = key;
        copy.key = `${key}-${d.key}`;
        return copy;
      });
      this.createGameAnimations(keyedAnimationData)
    })
  }

  public createGameAnimations(animationData: AnimationData[]): void {
    for (let data of animationData) {
      let frames;
      let framesArray;
      if (data.frames.typeOfGeneration === GenerationTypes.generateFrameNames) {
        frames = this.scene.anims.generateFrameNames(data.frames.key, {
          prefix: data.frames.prefix || '',
          start: data.frames.start || 0,
          end: data.frames.end || 0,
          suffix: data.frames.suffix || '',
          zeroPad: data.frames.zeroPad || 0,
          frames: data.frames.frames,
        });
      } else if (data.frames.typeOfGeneration === GenerationTypes.generateFrameNumbers) {
        frames = this.scene.anims.generateFrameNumbers(data.frames.key, {
          start: data.frames.start || 0,
          end: data.frames.end || -1,
          first: data.frames.first || false,
          frames: data.frames.frames || false
        });
      }
      this.scene.anims.create({
        key: data.key,
        frames: frames || framesArray,
        defaultTextureKey: data.defaultTextureKey || null,
        frameRate: data.frameRate || 24,
        duration: data.duration,
        skipMissedFrames: data.skipMissedFrames || true,
        delay: data.delay || 0,
        repeat: data.repeat || 0,
        repeatDelay: data.repeatDelay || 0,
        yoyo: data.yoyo || false,
        showOnStart: data.showOnStart || false,
        hideOnComplete: data.hideOnComplete || false
      });
    }
  }
}
