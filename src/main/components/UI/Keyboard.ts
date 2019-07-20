export class KeyboardControl {
  private events = {};
  constructor(private currentScene: Phaser.Scene) {}
  setupKeyboardControl() {
    // Setup first to be imperative, then eventually set it up to be more generic
    this.currentScene.input.keyboard.on("keydown", event => {
      switch (event.keyCode) {
        case Phaser.Input.Keyboard.KeyCodes.UP:
          this.emit("up");
          break;
        case Phaser.Input.Keyboard.KeyCodes.LEFT:
          this.emit("left");
          break;
        case Phaser.Input.Keyboard.KeyCodes.RIGHT:
          this.emit("right");
          break;
        case Phaser.Input.Keyboard.KeyCodes.DOWN:
          this.emit("down");
          break;
        case Phaser.Input.Keyboard.KeyCodes.ESC:
          this.emit("esc");
          break;
        case Phaser.Input.Keyboard.KeyCodes.SPACE:
          this.emit("space");
          break;
        case Phaser.Input.Keyboard.KeyCodes.Z:
          this.emit("z");
          break;
        default:
          break;
      }
    });
  }
  public on(eventName: any, uniqueContextId: string, fn: Function) {
    const eventObj = {
      uid: uniqueContextId,
      callback: fn
    };
    const addEvent = event => {
      this.events[event] = this.events[event]
        ? this.events[event].push(eventObj)
        : [eventObj];
    };
    if (Array.isArray(eventName)) {
      eventName.forEach(event => addEvent(event));
    } else {
      addEvent(eventName);
    }
  }
  public emit(eventName: string) {
    const eventArray = this.events[eventName];
    if (eventArray) {
      eventArray.forEach(event => {
        event.callback();
      });
    }
  }
  public off(eventName: string, uniqueContextId: string) {
    this.events[eventName] = this.events[eventName].filter(event => {
      return event.uid !== uniqueContextId;
    });
  }
  removeAllKeyboardControl() {}
}
