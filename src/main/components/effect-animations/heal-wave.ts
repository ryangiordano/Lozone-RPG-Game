import { GREEN } from "../../utility/Constants";
import { scaleUp } from "../../utility/tweens/text";
import { wait } from "../../utility/Utility";
export const healWave = (
  x,
  y,
  scene: Phaser.Scene,
  container?: Phaser.GameObjects.Container
): Promise<any> => {
  return new Promise(async (resolve) => {
    scene.sound.play("tiny-heal", { volume: 0.1 });
    const implosion: Phaser.GameObjects.Sprite = scene.add.sprite(
      x,
      y,
      "implosion"
    );

    const explosion: Phaser.GameObjects.Sprite = scene.add.sprite(
      x,
      y,
      "implosion"
    );
    explosion.setFrame(0);
    explosion.setScale(0.01);
    container && container.add(explosion);

    const s = () =>
      new Promise((resolve) =>
        scaleUp(explosion, scene, 500, "Sine.easeOut", () => {
          resolve();
          explosion.destroy();
        }).play()
      );

    implosion.setTint(GREEN.hex);
    implosion.setAlpha(0.5);
    implosion.scaleX = 0.7;
    implosion.scaleY = 0.7;
    container && container.add(implosion);
    container && container.bringToTop(implosion);
    scene.cameras.main.flash(100, 255, 255, 255);
    implosion.anims.play("implosion");

    implosion.on("animationcomplete", async () => {
      implosion.destroy();

      await s();
      await wait(500);
      resolve();
    });
  });
};
