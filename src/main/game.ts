import 'phaser';
import { Explore } from './scenes/explore';
import { BootScene } from './scenes/bootScene';
import PhaserUpdatePlugin from './utility/UpdatePlugin';
// main game configuration
const config: GameConfig = {
  width: 160,
  height: 144,
  zoom: 4,
  type: Phaser.AUTO,
  parent: 'game',
  scene: [BootScene, Explore],
  input: {
    keyboard: true
  },
  plugins: {
    scene: [
      { key: 'updatePlugin', plugin: PhaserUpdatePlugin, mapping: 'updates' }
    ]
  },
  physics: {
    default: 'arcade',
    backgroundColor: '#f8f8f8',
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
window.addEventListener('load', () => {
  var game = new Game(config);
});
