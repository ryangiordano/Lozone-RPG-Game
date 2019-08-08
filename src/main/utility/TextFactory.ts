export class TextFactory {
  constructor(private scene: Phaser.Scene) {

  }
  createText(content: string, position: Coords, fontSize: string = '32px', config?: any) {
    return new Phaser.GameObjects.Text(this.scene, position.x, position.y, content, {
      fontSize,
      fontFamily: 'pixel',
      fill: '#000000',
      ...config
    })
  }
}
