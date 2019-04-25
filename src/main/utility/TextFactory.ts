export class TextFactory {
  constructor() {

  }
  createText(content: string, position: Coords, scene: Phaser.Scene, fontSize: string = '8px', config?: any) {
    return new Phaser.GameObjects.Text(scene, position.x, position.y, content, {
      fontSize,
      fontFamily: 'pixel',
      fill: '#000000',
      ...config
    })
  }
}
