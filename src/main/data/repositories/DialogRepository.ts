class Dialog {
  constructor(public id: number | string, public content: string[]) {}
}
export class DialogRepository {
  private dialogFromDB;
  constructor(dialog) {
    this.dialogFromDB = dialog;
  }
  getDialogById(id: number | string) {
    return this.dialogFromDB.dialog[id];
  }
}
