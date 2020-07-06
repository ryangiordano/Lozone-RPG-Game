import { AudioScene } from "../../scenes/audioScene";

export const hitEffect = (
  x,
  y,
  scene: Phaser.Scene,
  container?: Phaser.GameObjects.Container,
  sprite?: string,
  sound?: string
): Promise<any> => {
  sprite = sprite || "hit";
  sound = sound || "hit";

  return new Promise((resolve) => {
    scene.sound.play(sound, { volume: 0.1 });
    const hit: Phaser.GameObjects.Sprite = scene.add.sprite(x, y, sprite);
    container && container.add(hit);
    container && container.bringToTop(hit);
    hit.setTint(0xffffff);
    hit.anims.play(sprite);
    hit.setScale(1.5, 1.5);
    hit.setOrigin(0.5, 0.5);
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
  container?: Phaser.GameObjects.Container,
  sprite?: string,
  sound?: string
): Promise<any> => {
  sprite = sprite || "critical-hit";
  sound = sound || "critical-hit";

  return new Promise((resolve) => {
    const hit: Phaser.GameObjects.Sprite = scene.add.sprite(x, y, sprite);
    const audio = <AudioScene>scene.scene.get("Audio");
    container && container.add(hit);
    container && container.bringToTop(hit);
    hit.setTint(0xffffff);
    hit.setScale(1.5, 1.5);
    hit.setOrigin(0.5, 0.5);

    hit.anims.play(sprite);

    hit.on("animationcomplete", () => {
      hit.destroy();
      audio.playSound(sound);
      scene.cameras.main.flash(150, 255, 255, 255);

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
