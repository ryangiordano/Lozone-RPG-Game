import { PanelContainer } from "../../components/UI/PanelContainer";
import { TextFactory } from "../../utility/TextFactory";
import { State } from "../../utility/state/State";

export default class CoinPanel extends PanelContainer {
  private currentCoins = 0;
  private queue = [];
  constructor(pos, scene) {
    super({ x: 4, y: 1 }, pos, "dialog-white", scene);
  }
  init() {
    this.show();
    const coin = this.scene.add.sprite(25, 32, "coin");
    coin.setScale(0.5, 0.5);
    this.add(coin);
    this.scene.anims.create({
      key: "spin",
      frames: this.scene.anims.generateFrameNumbers("coin", {
        frames: [0, 1, 2, 1],
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.currentCoins = State.getInstance().playerContents.getCoins();
    this._updateCoins(this.currentCoins);
    coin.anims.play("spin");
  }

  public increaseCoinsTo(newValue: number) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentCoins = Math.min(this.currentCoins + 10, newValue);
        this._updateCoins(this.currentCoins);
        resolve();
      }, 25);
    });
  }
  public decreaseCoinsTo(newValue: number) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentCoins = Math.max(this.currentCoins - 10, newValue);
        this._updateCoins(this.currentCoins);
        resolve();
      }, 25);
    });
  }
  public async updateCoins(newValue: number) {
    if (this.currentCoins < newValue) {
      while (this.currentCoins < newValue) {
        await this.increaseCoinsTo(newValue);
      }
    } else if (this.currentCoins > newValue) {
      while (this.currentCoins > newValue) {
        await this.decreaseCoinsTo(newValue);
      }
    } else {
      this._updateCoins(this.currentCoins);
    }
  }

  private _updateCoins(newValue: number) {
    this.clearPanelContainerByType("Text");
    const th = new TextFactory(this.scene);
    const coinAmount = th.createText(`${newValue}`, { x: 50, y: 10 });
    this.add(coinAmount);
  }
}
