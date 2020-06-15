import { CircuitRepository } from "../repositories/CircuitRepository";
import { State } from "../../utility/state/State";

export class CircuitController {
  private circuitRepository: CircuitRepository;
  constructor(game: Phaser.Game) {
    this.circuitRepository = new CircuitRepository(game);
  }
  getCircuitById(id: number) {
    return { id, ...this.circuitRepository.getById(id) };
  }

  activateCircuit(activate: boolean, circuitId: number) {
    const c = this.getCircuitById(circuitId);
    if (c) {
      const sm = State.getInstance();
      sm.setFlag(c.flagId, activate);
    } else {
      console.error(`Circuit of id ${circuitId} does not exist`);
    }
  }

  circuitIsActive(circuitId) {
    const c = this.getCircuitById(circuitId);
    if (c) {
      const sm = State.getInstance();
      return sm.allAreFlagged([c.flagId]);
    }
  }
}
