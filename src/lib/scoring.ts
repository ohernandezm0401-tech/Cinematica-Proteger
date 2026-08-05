import type { Direction, SessionConfig, TrialRecord } from "./types";
import { logMARToSnellen } from "./snellen";

export function isCorrect(gap: Direction, response: Direction): boolean {
  return gap === response;
}

export interface LevelOutcome {
  passed: boolean;
  correctCount: number;
  total: number;
  percent: number;
}

export function evaluateLevel(
  trials: TrialRecord[],
  levelLogMAR: number,
  passThreshold: number,
  /** Only count the last N trials at this level (current block). */
  lastN?: number,
): LevelOutcome {
  let levelTrials = trials.filter(
    (t) => Math.abs(t.levelLogMAR - levelLogMAR) < 1e-9,
  );
  if (lastN !== undefined && lastN > 0) {
    levelTrials = levelTrials.slice(-lastN);
  }
  const total = levelTrials.length;
  const correctCount = levelTrials.filter((t) => t.correct).length;
  const percent = total === 0 ? 0 : correctCount / total;
  return {
    passed: total > 0 && percent >= passThreshold,
    correctCount,
    total,
    percent,
  };
}

export interface ScoreProgress {
  /** Next level to test; null if session finished */
  nextLogMAR: number | null;
  levelsPassed: number[];
  consecutiveFails: number;
  finished: boolean;
  finalLogMAR: number | null;
}

/**
 * After a full block of trials at currentLogMAR:
 * - Pass (≥ threshold) → go to smaller size (step down); reset fails
 * - Fail → consecutiveFails++; if < 2 retest same level; if ≥ 2 stop with last passed
 * - If next would go below minLogMAR after pass → finish with current as final
 */
export function afterLevelComplete(
  config: SessionConfig,
  currentLogMAR: number,
  levelsPassed: number[],
  consecutiveFails: number,
  levelPassed: boolean,
): ScoreProgress {
  if (levelPassed) {
    const nextPassed = [...levelsPassed, roundLogMAR(currentLogMAR)];
    const next = roundLogMAR(currentLogMAR - config.stepLogMAR);
    if (next < config.minLogMAR - 1e-9) {
      return {
        nextLogMAR: null,
        levelsPassed: nextPassed,
        consecutiveFails: 0,
        finished: true,
        finalLogMAR: roundLogMAR(currentLogMAR),
      };
    }
    return {
      nextLogMAR: next,
      levelsPassed: nextPassed,
      consecutiveFails: 0,
      finished: false,
      finalLogMAR: null,
    };
  }

  const fails = consecutiveFails + 1;
  if (fails >= 2) {
    const final =
      levelsPassed.length > 0
        ? levelsPassed[levelsPassed.length - 1]!
        : null;
    return {
      nextLogMAR: null,
      levelsPassed,
      consecutiveFails: fails,
      finished: true,
      finalLogMAR: final,
    };
  }

  // One fail: retest same level
  return {
    nextLogMAR: roundLogMAR(currentLogMAR),
    levelsPassed,
    consecutiveFails: fails,
    finished: false,
    finalLogMAR: null,
  };
}

export function overallPercentCorrect(trials: TrialRecord[]): number {
  if (trials.length === 0) return 0;
  return trials.filter((t) => t.correct).length / trials.length;
}

export function buildResultSummary(
  trials: TrialRecord[],
  levelsPassed: number[],
  finalLogMAR: number | null,
) {
  return {
    finalLogMAR,
    snellenEquivalent:
      finalLogMAR === null ? null : logMARToSnellen(finalLogMAR),
    percentCorrect: overallPercentCorrect(trials),
    levelsPassed,
  };
}

export function roundLogMAR(v: number): number {
  return Math.round(v * 100) / 100;
}
