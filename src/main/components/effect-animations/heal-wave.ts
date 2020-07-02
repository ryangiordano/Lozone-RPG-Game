import { GREEN } from "../../utility/Constants";
export const healWave = (
  x,
  y,
  scene: Phaser.Scene,
  container?: Phaser.GameObjects.Container
): Promise<any> => {
  return new Promise((resolve) => {
    scene.sound.play("tiny-heal", { volume: 0.1 });
    const implosion: Phaser.GameObjects.Sprite = scene.add.sprite(
      x,
      y,
      "implosion"
    );

    implosion.setTint(GREEN.hex);
    implosion.setAlpha(0.5);
    implosion.scaleX = 0.7;
    implosion.scaleY = 0.7;
    container && container.add(implosion);
    container && container.bringToTop(implosion);
    scene.cameras.main.flash(100, 255, 255, 255);
    implosion.anims.play("implosion");

    implosion.on("animationcomplete", () => {
      implosion.destroy();
      resolve();
    });
  });
};
