import { Item } from "../entities/Items/Item";
import { textScaleUp } from "../../utility/tweens/text";

export const animateItemAbove = (
  item: Item,
  coords: Coords,
  scene: Phaser.Scene
) => {
  return new Promise((resolve) => {
    const itemSprite = new Phaser.GameObjects.Sprite(
      scene,
      coords.x,
      coords.y,
      item.spriteKey
    );
    itemSprite.setFrame(item.frame);
    scene.add.existing(itemSprite);
    const tween = textScaleUp(itemSprite, 0, -80, scene, () => {
      itemSprite.destroy();
      resolve();
    });
    tween.play();
  });
};
