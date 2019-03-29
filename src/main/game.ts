import "phaser";
import { MainScene } from "./scenes/mainScene";
import { BootScene } from "./scenes/bootScene";
// main game configuration
const config: GameConfig = {
  width: 160,
  height: 144,
  zoom: 4,
  type: Phaser.AUTO,
  parent: "game",
  scene: [BootScene, MainScene],
  input: {
    keyboard: true
  },
  physics: {
    default: "arcade",
    arcade: {
      // gravity: { y: 200 }
      debug: true
    },
    backgroundColor: "#f8f8f8",
    render: { pixelArt: true, antialias: false }
  }
};

// game class
export class Game extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }
}

// when the page is loaded, create our game instance
window.addEventListener("load", () => {
  var game = new Game(config);
});
