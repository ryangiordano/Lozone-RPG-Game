import { Explore } from "./exploreScene";
import { AudioScene } from "../audioScene";

export class HouseScene extends Explore {
  constructor() {
    super("House");
  }
  afterInit(data) {
    // Custom initialization stuff
    const audio = <AudioScene>this.scene.get("Audio");
    audio.play("home");
  }
  beforeDestroy() {}
}
