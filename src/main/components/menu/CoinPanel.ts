import { PanelContainer } from "../../components/UI/PanelContainer";
import { TextFactory } from "../../utility/TextFactory";
import { State } from "../../utility/state/State";

export default class CoinPanel extends PanelContainer {
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
            frames: this.scene.anims.generateFrameNumbers("coin", { frames: [0, 1, 2, 1] }),
            frameRate: 10,
            repeat: -1,
        });
        this.updateCoins(State.getInstance().playerContents.getCoins())
        coin.anims.play("spin");
    }
    public updateCoins(newValue: number) {
        this.clearPanelContainerByType("Text");
        const th = new TextFactory(this.scene);
        const coinAmount = th.createText(
            `${newValue}`,
            { x: 50, y: 10 }
        );
        this.add(coinAmount);

    }
}