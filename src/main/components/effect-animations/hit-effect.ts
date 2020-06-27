import { AudioScene } from "../../scenes/audioScene";

export const hitEffect = (
  x,
  y,
  scene: Phaser.Scene,
  container?: Phaser.GameObjects.Container
): Promise<any> => {
  return new Promise((resolve) => {
    scene.sound.play("hit", { volume: 0.1 });
    const hit: Phaser.GameObjects.Sprite = scene.add.sprite(x, y, "hit");
    container && container.add(hit);
    container && container.bringToTop(hit);
    hit.setTint(0xffffff);
    hit.anims.play("hit1");

    hit.on("animationcomplete", () => {
      hit.destroy();
      resolve();
    });
  });
};

export const deathEffect = (
  x,
  y,
  scene: Phaser.Scene,
  container?: Phaser.GameObjects.Container
): Promise<any> => {
  return new Promise((resolve) => {
    const hit: Phaser.GameObjects.Sprite = scene.add.sprite(x, y, "hit");
    container && container.add(hit);
    container && container.bringToTop(hit);
    hit.setTint(0xffffff);
    hit.anims.play("critical-hit");

    hit.on("animationcomplete", () => {
      hit.destroy();
      resolve();
    });
  });
};

export const criticalHitEffect = (
  x,
  y,
  scene: Phaser.Scene,
  container?: Phaser.GameObjects.Container
): Promise<any> => {
  return new Promise((resolve) => {
    const hit: Phaser.GameObjects.Sprite = scene.add.sprite(
      x,
      y,
      "critical-hit"
    );
    const audio = <AudioScene>scene.scene.get("Audio");
    container && container.add(hit);
    container && container.bringToTop(hit);
    hit.setTint(0xffffff);
    hit.anims.play("critical-hit");

    hit.on("animationcomplete", () => {
      hit.destroy();
      audio.playSound("critical-hit");
      scene.cameras.main.flash(150, 255, 255, 255);

      resolve();
    });
  });
};
