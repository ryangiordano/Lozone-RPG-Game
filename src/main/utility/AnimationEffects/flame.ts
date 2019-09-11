
export const flame = (x, y, scene: Phaser.Scene, container?: Phaser.GameObjects.Container): Promise<any> => {
    return new Promise(resolve => {
        scene.sound.play("hit", { volume: .1 });
        const hit: Phaser.GameObjects.Sprite = scene.add.sprite(x, y, 'hit');
        container && container.add(hit);
        container && container.bringToTop(hit)
        hit.setTint(0xffffff)
        hit.anims.play('hit1');

        hit.on('animationcomplete', () => {
            hit.destroy();
            resolve();
        });
    })

}