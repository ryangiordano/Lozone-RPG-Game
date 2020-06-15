// Three classes for interacting with the data stored in
import { Repository } from "./Repository";

export interface Circuit {
  name: string;
  description: string;
  flagId: number;
  color: number;
  id:number;
}

export class CircuitRepository extends Repository<Circuit> {
  constructor(game) {
    const circuits = game.cache.json.get("circuits");
    super(circuits);
  }
}
