import { wait } from "./../../utility/Utility";
export enum KeyboardControlKeys {
  UP,
  DOWN,
  LEFT,
  RIGHT,
  ESC,
  SPACE,
  Z,
}

export class KeyboardControl {
  private events = {};
  private disabled = false;
  private keyDown = false;
  public setDisabled(disabled) {
    this.disabled = disabled;
  }
  constructor(private currentScene: Phaser.Scene) {}
  setupKeyboardControl() {
    // Setup first to be imperative, then eventually set it up to be more generic
    this.currentScene.input.keyboard.on("keydown", async (event) => {
      if (this.keyDown || this.disabled) return;
      this.keyDown = true;
      switch (event.keyCode) {
        case Phaser.Input.Keyboard.KeyCodes.UP:
          this.emit(KeyboardControlKeys.UP);
          break;
        case Phaser.Input.Keyboard.KeyCodes.LEFT:
          this.emit(KeyboardControlKeys.LEFT);
          break;
        case Phaser.Input.Keyboard.KeyCodes.RIGHT:
          this.emit(KeyboardControlKeys.RIGHT);
          break;
        case Phaser.Input.Keyboard.KeyCodes.DOWN:
          this.emit(KeyboardControlKeys.DOWN);
          break;
        case Phaser.Input.Keyboard.KeyCodes.ESC:
          this.emit(KeyboardControlKeys.ESC);
          break;
        case Phaser.Input.Keyboard.KeyCodes.SPACE:
          this.emit(KeyboardControlKeys.SPACE);
          await wait(100);
          break;
        case Phaser.Input.Keyboard.KeyCodes.Z:
          this.emit(KeyboardControlKeys.Z);
          break;
        default:
          break;
      }
      this.keyDown = false;

    });
  }

  public on(eventName: any, uniqueContextId: string, fn: Function) {
    const eventObj = {
      uid: uniqueContextId,
      callback: fn,
    };
    const addEvent = (event) => {
      this.events[event] = this.events[event]
        ? this.events[event].push(eventObj)
        : [eventObj];
    };
    if (Array.isArray(eventName)) {
      eventName.forEach((event) => addEvent(event));
    } else {
      addEvent(eventName);
    }
  }

  public emit(eventName: KeyboardControlKeys) {
    const eventArray = this.events[eventName];
    if (eventArray) {
      eventArray.forEach((event) => {
        event.callback();
      });
    }
  }

  public off(eventName: KeyboardControlKeys, uniqueContextId: string) {
    this.events[eventName] =
      this.events[eventName] &&
      this.events[eventName].filter((event) => {
        return event.uid !== uniqueContextId;
      });
  }
  removeAllKeyboardControl() {}
}
