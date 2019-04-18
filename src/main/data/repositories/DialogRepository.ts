import { Repository } from "./Repository";
import { Dialog } from "../../components/UI/Dialog";
export class DialogRepository extends Repository<Dialog> {
  constructor(game) {
    const dialog= game.cache.json.get('dialog');
    super(dialog);

  }
  getDialogById(id: number | string) {
    return this.getById(id);
  }
}
