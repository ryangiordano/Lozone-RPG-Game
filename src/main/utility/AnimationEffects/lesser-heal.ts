import { getRandomInt } from "../Utility";


export const lesserHeal = async (x, y, scene, container?: Phaser.GameObjects.Container) => {
    scene.sound.play("heal", { volume: .1 });
    const heal = scene.add.sprite(x, y, 'heal');

    heal.setAlpha(.7)

    container && container.add(heal);
    container && container.bringToTop(heal)
    return new Promise(resolve => {
        heal.anims.play('heal1')
        heal.on('animationcomplete', () => {
            heal.destroy();
            for (let i = 0; i < 3; i++) {

                setTimeout(() => {
                    const randx = getRandomInt(x - 30, x + 30);
                    const randy = getRandomInt(y - 30, y + 30);
                    const healSparkle = scene.add.sprite(randx, randy, 'heal-sparkle');
                    healSparkle.setAlpha(.7)
                    container && container.add(healSparkle);
                    container && container.bringToTop(healSparkle)
                    healSparkle.anims.play('heal-sparkle1')
                    healSparkle.on('animationcomplete', () => healSparkle.destroy())

                }, i * 200)
            }
            resolve();
        });
    })

}
