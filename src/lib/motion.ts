import type { Direction, MotionDirection, Speed } from "./types";
import { DIRECTIONS } from "./types";

/** Duration in ms for one horizontal sweep across the stimulus area. */
export function sweepDurationMs(speed: Speed): number {
  switch (speed) {
    case "slow":
      return 4500;
    case "fast":
      return 1800;
    case "medium":
    default:
      return 3000;
  }
}

export function randomDirection(): Direction {
  return DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]!;
}

export function randomMotion(): MotionDirection {
  return Math.random() < 0.5 ? "L2R" : "R2L";
}

/** Gap rotation in degrees for canvas (0 = gap on the right). */
export function gapRotationDeg(gap: Direction): number {
  switch (gap) {
    case "right":
      return 0;
    case "down":
      return 90;
    case "left":
      return 180;
    case "up":
      return 270;
  }
}
