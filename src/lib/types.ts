export type Eye = "OD" | "OI" | "AO";
export type Speed = "slow" | "medium" | "fast";
export type Direction = "up" | "down" | "left" | "right";
export type MotionDirection = "L2R" | "R2L";

export interface SessionConfig {
  eye: Eye;
  distanceMeters: number;
  speed: Speed;
  ppi: number;
  calibrated: boolean;
  trialsPerLevel: number;
  passThreshold: number;
  startLogMAR: number;
  minLogMAR: number;
  stepLogMAR: number;
}

export interface TrialRecord {
  levelLogMAR: number;
  gapDirection: Direction;
  motion: MotionDirection;
  response: Direction;
  correct: boolean;
  rtMs: number;
}

export interface SessionResultPayload {
  version: "1.0";
  startedAt: string;
  finishedAt: string;
  aborted: boolean;
  config: SessionConfig;
  trials: TrialRecord[];
  result: {
    finalLogMAR: number | null;
    snellenEquivalent: string | null;
    percentCorrect: number;
    levelsPassed: number[];
  };
}

export interface ActiveSession {
  config: SessionConfig;
  startedAt: string;
  trials: TrialRecord[];
  currentLogMAR: number;
  levelsPassed: number[];
  consecutiveFails: number;
  finished: boolean;
  aborted: boolean;
}

export const DEFAULT_CONFIG: SessionConfig = {
  eye: "OD",
  distanceMeters: 3,
  speed: "medium",
  ppi: 96,
  calibrated: false,
  trialsPerLevel: 5,
  passThreshold: 0.8,
  startLogMAR: 1.0,
  minLogMAR: 0.0,
  stepLogMAR: 0.1,
};

export const DISTANCE_OPTIONS = [1, 2, 3, 6] as const;
export const DIRECTIONS: Direction[] = ["up", "down", "left", "right"];

/** Credit card width in mm (ISO/IEC 7810 ID-1) */
export const CREDIT_CARD_WIDTH_MM = 85.6;
