import assert from "node:assert/strict";
import {
  afterLevelComplete,
  evaluateLevel,
  isCorrect,
  overallPercentCorrect,
} from "./scoring";
import type { SessionConfig, TrialRecord } from "./types";
import { DEFAULT_CONFIG } from "./types";

assert.equal(isCorrect("up", "up"), true);
assert.equal(isCorrect("up", "down"), false);

const config: SessionConfig = { ...DEFAULT_CONFIG, trialsPerLevel: 5 };

function makeTrials(
  level: number,
  results: boolean[],
): TrialRecord[] {
  return results.map((correct) => ({
    levelLogMAR: level,
    gapDirection: "right" as const,
    motion: "L2R" as const,
    response: correct ? ("right" as const) : ("left" as const),
    correct,
    rtMs: 500,
  }));
}

// 4/5 = 80% pass
const passTrials = makeTrials(1.0, [true, true, true, true, false]);
const passOutcome = evaluateLevel(passTrials, 1.0, 0.8, 5);
assert.equal(passOutcome.passed, true);

const failTrials = makeTrials(1.0, [true, true, false, false, false]);
const failOutcome = evaluateLevel(failTrials, 1.0, 0.8, 5);
assert.equal(failOutcome.passed, false);

// Pass advances to smaller logMAR
const adv = afterLevelComplete(config, 1.0, [], 0, true);
assert.equal(adv.nextLogMAR, 0.9);
assert.equal(adv.finished, false);
assert.deepEqual(adv.levelsPassed, [1.0]);

// Pass at min step finishes
const done = afterLevelComplete(
  { ...config, minLogMAR: 0.9 },
  1.0,
  [],
  0,
  true,
);
// next would be 0.9 which equals min - should continue to 0.9
// After pass at 0.9 with min 0.9: next 0.8 < min → finish
const doneMin = afterLevelComplete(
  { ...config, minLogMAR: 0.0 },
  0.0,
  [0.1],
  0,
  true,
);
assert.equal(doneMin.finished, true);
assert.equal(doneMin.finalLogMAR, 0.0);

// First fail → retest same level
const fail1 = afterLevelComplete(config, 0.5, [1.0, 0.9, 0.8, 0.7, 0.6], 0, false);
assert.equal(fail1.finished, false);
assert.equal(fail1.nextLogMAR, 0.5);
assert.equal(fail1.consecutiveFails, 1);

// Second fail → stop with last passed
const fail2 = afterLevelComplete(config, 0.5, [1.0, 0.9], 1, false);
assert.equal(fail2.finished, true);
assert.equal(fail2.finalLogMAR, 0.9);

assert.equal(overallPercentCorrect(passTrials), 0.8);

console.log("scoring.test.ts: OK");
