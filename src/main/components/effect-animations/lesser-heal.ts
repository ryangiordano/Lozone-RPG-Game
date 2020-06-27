import { getRandomInt } from "../../utility/Utility";

const innerSparkle = (x, y, scene, container, i) => {
  return new Promise(resolve => {

    setTimeout(() => {
      const randx = getRandomInt(x - 30, x + 30);
      const randy = getRandomInt(y - 30, y + 30);
      const healSparkle = scene.add.sprite(randx, randy, "heal-sparkle");
      healSparkle.setAlpha(0.7);
      container && container.add(healSparkle);
      container && container.bringToTop(healSparkle);
      healSparkle.anims.play("heal-sparkle1");
      healSparkle.on("animationcomplete", () => {

        healSparkle.destroy()
        resolve()
      });
    }, i * 200);
  })
}

export const lesserHeal = async (
  x,
  y,
  scene,
  container?: Phaser.GameObjects.Container
) => {
  scene.sound.play("heal", { volume: 0.1 });
  const heal = scene.add.sprite(x, y, "heal");

  heal.setAlpha(0.7);

  container && container.add(heal);
  container && container.bringToTop(heal);
  return new Promise((resolve) => {
    heal.anims.play("heal1");
    heal.on("animationcomplete", async () => {
      heal.destroy();
      const innerSparkles = [];
      for (let i = 0; i < 3; i++) {
        innerSparkles.push(innerSparkle(x, y, scene, container, i))
      }
      await Promise.all(innerSparkles);

      resolve();
    })

  });
};
