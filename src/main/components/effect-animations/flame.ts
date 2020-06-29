import { ORANGE } from "../../utility/Constants";

export const flame = (
  x,
  y,
  scene: Phaser.Scene,
  container?: Phaser.GameObjects.Container
): Promise<any> => {
  return new Promise((resolve) => {
    scene.sound.play("small-flame", { volume: 0.1 });
    const flame: Phaser.GameObjects.Sprite = scene.add.sprite(x, y, "flame");
    container && container.add(flame);
    container && container.bringToTop(flame);
    flame.setTint(ORANGE.hex);
    scene.cameras.main.flash(300, 245, 72, 66);
    flame.anims.play("flame");

    flame.on("animationcomplete", () => {
      flame.destroy();
      resolve();
    });
  });
};
