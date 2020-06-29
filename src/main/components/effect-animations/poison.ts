export const poison = (
  x,
  y,
  scene: Phaser.Scene,
  container?: Phaser.GameObjects.Container
): Promise<any> => {
  return new Promise((resolve) => {
    var particles = scene.add.particles("tiny-particle");

    scene.sound.play("poison", { volume: 0.1 });
    container && container.add(particles);
    container && container.bringToTop(particles);

    var explode = particles.createEmitter({
      frame: 2,
      x,
      y,
      speed: { min: 200, max: 250 },
      scale: { start: 1.4, end: 0 },
      gravityY: 500,
      frequency: 150,
      lifespan: 700,
      bounds: { x: x-100, y: y-100, width: 200, height: 150 },
      tint: [0xd9c8fb, 0xcf95e4, 0xc277da],
      deathCallback: true,
    });
    
    explode.explode(100, x, y);
    scene.cameras.main.flash(300, 170, 74, 226);

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
