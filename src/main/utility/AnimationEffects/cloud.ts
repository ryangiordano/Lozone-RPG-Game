export const cloud = (x, y, scene: Phaser.Scene): Promise<any> => {
  return new Promise((resolve) => {
    const sprite = scene.add.sprite(x, y, null);
    sprite.anims.play("cloud");

    sprite.on("animationcomplete", () => {
      sprite.destroy();
      resolve();
    });
  });
};
