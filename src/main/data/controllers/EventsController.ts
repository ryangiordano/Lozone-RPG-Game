import { State } from "./../../utility/state/State";
import {
  EventBlock,
  WaitBlock,
  RecoveryBlock,
  AudioBlock,
} from "../repositories/EventsRepository";
import { DialogScene, displayMessage } from "../../scenes/dialogScene";
import { asyncForEach, wait } from "../../utility/Utility";
import { AudioScene } from "../../scenes/audioScene";
import {
  CameraBlock,
  LightingBlock,
  DialogBlock,
  TransitionBlock,
} from "../repositories/EventsRepository";
import {
  EventLineRepository,
  EventLine,
} from "../repositories/EventsRepository";

export class EventsController {
  private eventLineRepository: EventLineRepository;
  constructor(private game: Phaser.Game) {
    this.eventLineRepository = new EventLineRepository(game);
  }
  getEventById(id: number) {
    return this.eventLineRepository.getById(id);
  }

  playEvent(id: number, scene) {
    return new Promise(async (resolve) => {
      const event = this.getEventById(id);
      await this.startPlaying(event, scene);
      console.log("And done");
      resolve();
    });
  }

  private startPlaying(event: EventLine, scene: Phaser.Scene) {
    // Chunk the events depending on if they're async
    const chunked: EventBlock[][] = event.timeline.reduce(
      (acc, e: EventBlock, i) => {
        if (e.async) {
          acc.length ? acc[acc.length - 1].push(e) : acc.push([e]);
        } else {
          acc.push([e]);
        }
        return acc;
      },
      []
    );
    const potentials = chunked.map((c: EventBlock[]) => {
      return c.map((block: EventBlock) => {
        switch (block.type) {
          case "camera":
            return () => this.executeCameraBlock(block, scene);
          case "lighting":
            return () => this.executeLightingBlock(block, scene);
          case "dialog":
            return () => this.executeDialogBlock(block, scene);
          case "scene-transition":
            return () => this.executeTransitionBlock(block, scene);
          case "wait":
            return () => this.executeWaitBlock(block);
          case "audio":
            return () => this.executeAudioBlock(block);
          case "recovery":
            return () => this.executeRecoveryBlock(block);
        }
      });
    });
    return new Promise(async (resolve) => {
      await asyncForEach(potentials, async (potential) => {
        return await Promise.all(potential.map((p) => p()));
      });
      resolve();
    });
  }

  private executeCameraBlock(block: CameraBlock, scene: Phaser.Scene) {
    return new Promise((resolve) => {
      scene.cameras.main.stopFollow();
      scene.cameras.main.removeBounds();

      if (block.direction === "x") {
        scene.cameras.main.pan(
          block.distance,
          scene.cameras.main.midPoint.y,
          block.dur,
          "Linear",
          false,
          (f, progress) => {
            if (progress === 1) {
              resolve();
            }
          }
        );
      } else {
        scene.cameras.main.pan(
          scene.cameras.main.midPoint.x,
          block.distance,
          block.dur,
          "Linear",
          false,
          (f, progress) => {
            if (progress === 1) {
              resolve();
            }
          }
        );
      }
    });
  }
  private executeLightingBlock(block: LightingBlock, scene: Phaser.Scene) {
    return new Promise((resolve) => {
      if (block.out) {
        scene.cameras.main.fadeOut(block.dur, 0, 0, 0, (f, progress) => {
          if (progress === 1) {
            resolve();
          }
        });
      } else {
        scene.cameras.main.fadeIn(block.dur, 0, 0, 0, (f, progress) => {
          if (progress === 1) {
            resolve();
          }
        });
      }
    });
  }
  private executeDialogBlock(block: DialogBlock, scene: Phaser.Scene) {
    return new Promise(async (resolve) => {
      await displayMessage(block.content, this.game, scene.scene);
      resolve();
    });
  }
  private executeTransitionBlock(block: TransitionBlock, scene: Phaser.Scene) {
    return new Promise((resolve) => {
      scene.scene.start(block.sceneName);
      resolve();
    });
  }
  private executeWaitBlock(block: WaitBlock) {
    return new Promise(async (resolve) => {
      await wait(block.dur);
      resolve();
    });
  }
  private executeRecoveryBlock(_block: RecoveryBlock) {
    return new Promise(async (resolve) => {
      const sm = State.getInstance();
      sm.getCurrentParty().fullHeal();
      const audio = <AudioScene>this.game.scene.getScene("Audio");
      audio.playSound("rest");
      await wait(5000);
      resolve();
    });
  }
  private executeAudioBlock(block: AudioBlock) {
    return new Promise(async (resolve) => {
      const audio = <AudioScene>this.game.scene.getScene("Audio");
      switch (block.action) {
        case "pause":
          audio.stop();
          break;
        case "play":
          audio.play(block.title);
          break;
        case "stop":
          audio.stop();
          break;
      }
      resolve();
    });
  }
}
