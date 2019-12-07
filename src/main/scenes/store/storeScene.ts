import { PanelContainer, UIPanel } from '../../components/UI/PanelContainer';
import { PartyMember } from "../../components/battle/PartyMember";
import { State } from "../../utility/state/State";
import { KeyboardControl } from "../../components/UI/Keyboard";
import { TextFactory } from '../../utility/TextFactory';
import { Bar, HpBar, MpBar, XpBar } from '../../components/UI/Bars';
import { CombatEntity } from '../../components/battle/CombatDataStructures';
import { Item, handleItemUse } from '../../components/entities/Item';
import { SpellType } from '../../data/repositories/SpellRepository';
import { UserInterface } from '../../components/UI/UserInterface';
import { StoreInterfaceBuilder } from '../../components/menu/shop/StoreInterface';

export class StoreScene extends Phaser.Scene {
  private storeUI: UserInterface;
  private callingSceneKey
  constructor() {
    super({ key: "StoreScene" });
  }
  preload() {
  }
  public init(data) {
    const {callingSceneKey} = data;
    const storeBuilder = new StoreInterfaceBuilder(this);

    this.storeUI = storeBuilder.create();
    const rect = new Phaser.GameObjects.Rectangle(this, 0, 0, 2000, 2000, 0x383838, 1);
    this.add.existing(rect);

    this.storeUI.on('close-menu',()=>{
      this.scene.setActive(true, this.callingSceneKey);
      this.scene.stop();
    })

  }


}

