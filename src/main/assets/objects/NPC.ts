import { Directions } from '../../utility/Utility';
import { Moveable } from '../../components/entities/Movement';

export class NPC extends Moveable {
  properties: any = {};
  constructor(
    { scene, x, y, key, map, casts },
    message?: String,
    facing?: Directions
  ) {
    super({ scene, x, y, key, map, casts });
    this.properties.message = message;
    this.properties.type = 'interactive';
    this.face(facing);
  }
}
