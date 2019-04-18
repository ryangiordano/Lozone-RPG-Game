import 'phaser';
import { BootScene } from './scenes/bootScene';
import PhaserUpdatePlugin from './utility/UpdatePlugin';
import { Plugin as NineSlicePlugin } from 'phaser3-nineslice';
import { MenuScene } from './scenes/menuScene';
import { CreditsScene } from './scenes/creditsScene';
import { HouseScene } from './scenes/houseScene';
import { DungeonScene } from './scenes/dungeonScene';
import { BattleScene } from './scenes/battleScene';
// main game configuration
const config: GameConfig = {
  width: 160,
  height: 144,
  zoom: 4,
  type: Phaser.AUTO,
  parent: 'game',
  scene: [BootScene, HouseScene, MenuScene, DungeonScene, CreditsScene, BattleScene],
  input: {
    keyboard: true
  },
  plugins: {
    global: [NineSlicePlugin.DefaultCfg],
    scene: [
      { key: 'updatePlugin', plugin: PhaserUpdatePlugin, mapping: 'updates' },
    ]
  },
  backgroundColor: '#383838',
  physics: {
    default: 'arcade',
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
