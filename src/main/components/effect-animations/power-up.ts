export const powerUp = (
  x,
  y,
  scene: Phaser.Scene,
  container?: Phaser.GameObjects.Container
): Promise<any> => {
  return new Promise((resolve) => {
    var particles = scene.add.particles("tiny-particle");

    scene.sound.play("power-up", { volume: 0.1 });
    container && container.add(particles);
    container && container.bringToTop(particles);
    let particleCount = 0;
    const powerUp = particles.createEmitter({
      frame: 2,
      x: { min: x - 40, max: x + 40 },
      y: y + 30,
      speed: { min: 50, max: 100 },
      scale: { start: 1.2, end: 0 },
      gravityY: -1000,
      frequency: 1,
      lifespan: 700,
      tint: [0xda5353, 0xf5aeae, 0xfeebeb],
      deathCallback: true,
    });
    scene.cameras.main.flash(300, 236, 105, 105);

    powerUp.onParticleDeath((p) => {
      particleCount++;
      if (particleCount >= 10) {
        powerUp.stop();
        setTimeout(() => {
          resolve();
        }, 1000);
      }
    });
  });
};
