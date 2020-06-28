export const flamePowerUp = (
  x,
  y,
  scene: Phaser.Scene,
  container?: Phaser.GameObjects.Container
): Promise<any> => {
  return new Promise((resolve) => {
    var particles = scene.add.particles("flame");

    scene.sound.play("small-flame", { volume: 0.1 });
    container && container.add(particles);
    container && container.bringToTop(particles);

    var explode = particles.createEmitter({
      frame: [0, 1, 2],
      x,
      y,
      speed: { min: 200, max: 250 },
      scale: { start: 1.5, end: 0 },
      gravityY: 100,
      frequency: 150,
      lifespan: 700,
      tint: [0xf56c42, 0xf9a085, 0xfdd8cd],
      deathCallback: true,
    });

    explode.explode(100, x, y);
    scene.cameras.main.flash(300, 245, 72, 66);

    explode.onParticleDeath(() => {
      if (explode.getDeadParticleCount() === 100) {
        explode.killAll();
        particles.destroy();
        setTimeout(() => {
          resolve();
        }, 1000);
      }
    });
  });
};
