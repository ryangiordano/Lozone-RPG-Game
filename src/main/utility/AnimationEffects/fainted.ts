export const fainted = (x, y, scene: Phaser.Scene, container?: Phaser.GameObjects.Container) => {
  scene.sound.play("large-flame", { volume: .1 });
  const fainted: Phaser.GameObjects.Sprite = scene.add.sprite(x, y, 'fainted');
  fainted.scaleX = .7;
  fainted.scaleY = .7;
  container && container.add(fainted);
  container && container.bringToTop(fainted)
  fainted.anims.play('fainted');
  return () => {
    if (fainted && fainted.anims) {
      fainted.anims && fainted.anims.stop();
      fainted.destroy();
    }

  }
}