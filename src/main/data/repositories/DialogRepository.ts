export class DialogRepository {
  private dialogFromDB;
  constructor(dialogContext) {
    this.dialogFromDB = dialogContext;
  }
  getDialogById(id: number | string) {
    return this.dialogFromDB[id];
  }
}
