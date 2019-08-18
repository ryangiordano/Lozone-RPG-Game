export interface Dialog {
  content: string[];
}

// export class DialogManager {
//   private dialog: Phaser.GameObjects.RenderTexture;
//   private dialogArray: string[] = [];
//   private currentText: Phaser.GameObjects.Text;
//   private bookmark: Function;
//   constructor(
//     private currentScene: Phaser.Scene,
//     private silent: boolean = false,
//     color?: string
//   ) {
//     this.dialog = currentScene.add.nineslice(
//       0,
//       384,
//       640,
//       192,
//       color || "dialog-white",
//       20
//     );
//     this.dialog.visible = false;
//     this.dialog.setScrollFactor(0);
//     this.setKeyboardListeners();
//   }

//   private createDialogArray(messages: string[]) {
//     const charsPerDialog = 75;
//     const result = [];

//     // We need to get the number of chars that can reasonably fit on a line.  Since we're only coding for one screen size
//     // We can make a reasonable guess and go off of that. // 130 is a reasonable guess.
//     messages.forEach(message => {
//       const textArray = message.split("");

//       while (textArray.length) {
//         let start = charsPerDialog;
//         while (textArray[start] && textArray[start] !== " ") {
//           start--;
//         }
//         result.push(textArray.splice(0, start).join(""));
//       }
//     });
//     this.dialogArray = result.reduce((acc, el) => {
//       acc.push(el);
//       return acc;
//     }, []);
//   }

//   public displayDialog(message: string[]): Promise<any> {
//     // this.setKeyboardListeners();
//     this.dialog.visible = true;
//     this.createDialogArray(message);
//     this.handleNextDialog();

//     return new Promise(resolve => {
//       this.bookmark = () => {
//         resolve();
//       };
//     });
//   }

//   public hideDialog() {
//     this.dialog.visible = false;
//   }

//   public dialogVisible() {
//     return this.dialog.visible;
//   }

//   public handleNextDialog() {
//     if (this.currentText) {
//       this.currentText.destroy();
//     }

//     if (!this.dialogArray.length) {
//       this.bookmark();
//       this.hideDialog();
//     } else {
//       !this.silent &&
//         this.currentScene.sound.play("beep", {
//           volume: 0.005,
//           rate: 1,
//           detune: 0,
//           seek: 0,
//           loop: false,
//           delay: 0
//         });
//       const toShow = this.dialogArray.shift();

//       this.currentText = this.currentScene.add.text(4 * 4, 99 * 4, toShow, {
//         fontFamily: "pixel",
//         fontSize: "32px",
//         fill: "#000000",
//         wordWrap: {
//           width: (this.dialog.width / 4.5) * 4,
//           useAdvancedWrap: true
//         }
//       });
//       this.currentText.setScrollFactor(0);
//     }
//   }
//   private setKeyboardListeners() {
//     this.currentScene.input.keyboard.on("keydown-space", () => {
//       if (this.dialogVisible()) {
//         this.handleNextDialog();
//       }
//     });
//   }
// }
