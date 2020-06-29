export const spellCast = (
  x,
  y,
  scene: Phaser.Scene,
  container?: Phaser.GameObjects.Container
): Promise<any> => {
  return new Promise((resolve) => {
    var particles = scene.add.particles("tiny-particle");
    const source = scene.add.circle(0, 0, 150);
    scene.sound.play("spell-cast", { volume: 0.1 });
    container && container.add(particles);
    container && container.bringToTop(particles);
    const em1 = particles.createEmitter({
      frame: [0, 1, 2],
      // alpha: 0.75,
      x,
      y,
      blendMode: "SCREEN",
      emitZone: {
        type: "edge",
        source: new Phaser.Geom.Circle(0, 0, 45),
        quantity: 10,
      },
      speed: { min: -100, max: 100 },
      scale: { start: 1, end: 0 },
      // frequency: 5,
      // lifespan: 200,
      tint: [0x778eff],
      deathCallback: true,
    });

    let pCount = 0;
    em1.onParticleDeath(() => {
      pCount++;
      if (pCount >= 25) {
        em1.killAll();
        particles.destroy();
        source.destroy();
        setTimeout(() => {
          resolve();
        }, 500);
      }
    });
  });
};
