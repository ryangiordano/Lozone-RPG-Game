import { PartyMenuContainer } from "./Shared/PartyMenuContainer";

export class PartyMenuScene extends Phaser.Scene {
  protected callingSceneKey: string;
  constructor({ key }: { key: string }) {
    super({ key });
  }

  public init(data) {}
}
