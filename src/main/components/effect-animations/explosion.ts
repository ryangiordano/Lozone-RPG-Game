export const explosion = (x, y, scene: Phaser.Scene, container?: Phaser.GameObjects.Container): Promise<any> => {
  return new Promise(resolve => {
      scene.sound.play("large-flame", { volume: .1 });
      const explosion: Phaser.GameObjects.Sprite = scene.add.sprite(x, y, 'explosion');
      explosion.scaleX = .7;
      explosion.scaleY = .7;
      container && container.add(explosion);
      container && container.bringToTop(explosion)
      scene.cameras.main.flash(100,255,255,255)
      explosion.anims.play('explosion');

      explosion.on('animationcomplete', () => {
          explosion.destroy();
          resolve();
      });
  })

}