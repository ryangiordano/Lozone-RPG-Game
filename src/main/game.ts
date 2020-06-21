import "phaser";
import PhaserUpdatePlugin from "./utility/UpdatePlugin";
import { Plugin as NineSlicePlugin } from "phaser3-nineslice";
import { CreditsScene } from "./scenes/credits/creditsScene";
import { HouseScene } from "./scenes/exploration/houseScene";
import { DungeonScene } from "./scenes/exploration/dungeonScene";
import { CombatScene } from "./scenes/combat/combatScene";
import { GameOverScene } from "./scenes/gameOverScene";
import { BootScene } from "./scenes/UI/bootScene";
import { MenuScene } from "./scenes/UI/menuScene";
import { DialogScene } from "./scenes/dialogScene";
import { PartyMenuScene } from "./scenes/UI/PartyMenu/PartyMenuScene";
import { AudioScene } from "./scenes/audioScene";
import { PartyItemUseScene } from "./scenes/UI/PartyMenu/PartyItemUse/PartyItemUseScene";
import { PartyStatusScene } from "./scenes/UI/PartyMenu/PartyStatus/PartyStatusScene";
import { PartySpellCastScene } from "./scenes/UI/PartyMenu/PartySpellCast/PartySpellCastScene";
import { PartySpellSelectScene } from "./scenes/UI/PartyMenu/PartySpellCast/PartySpellSelectScene";
import { PartyEquipScene } from "./scenes/UI/PartyMenu/PartyEquip/PartyEquipScene";
import { ShopScene } from './scenes/shopScene';

export type GameScenes =
  | "BootScene"
  | "House"
  | "MenuScene"
  | "Dungeon"
  | "Battle"
  | "PartyItemUseScene"
  | "PartyStatusScene"
  | "PartySpellCastScene"
  | "PartySpellSelectScene"
  | "PartyEquipScene"
  | "StoreScene"
  | "GameOverScene"
  | "ShopScene"
  | "Audio";

// main game configuration
const config: GameConfig = {
  width: 640,
  height: 576,
  zoom: 1,
  type: Phaser.AUTO,
  parent: "game",
  scene: [
    BootScene,
    HouseScene,
    MenuScene,
    DungeonScene,
    CreditsScene,
    CombatScene,
    DialogScene,
    PartyItemUseScene,
    PartyStatusScene,
    PartySpellCastScene,
    PartySpellSelectScene,
    PartyEquipScene,
    GameOverScene,
    AudioScene,
    ShopScene,
  ],
  input: {
    keyboard: true,
  },
  plugins: {
    global: [NineSlicePlugin.DefaultCfg],
    scene: [
      { key: "updatePlugin", plugin: PhaserUpdatePlugin, mapping: "updates" },
    ],
  },
  backgroundColor: "#383838",
  physics: {
    default: "arcade",
    render: { pixelArt: true, antialias: false },
  },
};

export class Game extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }
}

window.addEventListener("load", () => {
  var game = new Game(config);
});
