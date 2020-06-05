import { Repository } from "./Repository";
export type EventBlock = CameraBlock &
  LightingBlock &
  DialogBlock &
  TransitionBlock &
  WaitBlock;

export interface EventLine {
  name: string;
  description: string;
  timeline: EventBlock[];
}

type EventType = "camera" | "lighting" | "dialog" | "scene-transition" | "wait";

interface BaseEventBlock {
  /** Type of EventBlock */
  type: EventType;
  /** Whether to run the event alongside following events */
  async: boolean;
}

export interface CameraBlock extends BaseEventBlock {
  type: "camera";
  async: boolean;
  direction: "x" | "y";
  /** Distance for the camera to move in pixels */
  distance: number;
  /** The amount of time the movement should take in milliseconds */
  dur: 5000;
}

export interface LightingBlock extends BaseEventBlock {
  type: "lighting";
  async: boolean;
  /** The color of the lighting fade */
  out: boolean;
  /** The amount of time the lighting block should take to finish in milliseconds */
  dur: 5000;
}

export interface DialogBlock extends BaseEventBlock {
  type: "dialog";
  async: boolean;
  /** The content to display in the message box */
  content: string[];
}

export interface TransitionBlock extends BaseEventBlock {
  type: "scene-transition";
  async: boolean;
  /** The name of the scene to transition to */
  sceneName: string;
}

export interface WaitBlock extends BaseEventBlock {
  type: "wait";
  async: boolean;
  dur: 5000;
}
export class EventLineRepository extends Repository<EventLine> {
  constructor(game: Phaser.Game) {
    const enemies = game.cache.json.get("events");
    super(enemies);
  }
}
