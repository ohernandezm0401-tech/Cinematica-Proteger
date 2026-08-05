import type {
  ActiveSession,
  SessionConfig,
  SessionResultPayload,
  TrialRecord,
} from "./types";
import { DEFAULT_CONFIG } from "./types";
import { buildResultSummary } from "./scoring";

const STORAGE_KEY = "avc-active-session-v1";
const RESULT_KEY = "avc-last-result-v1";

export function createSession(config: Partial<SessionConfig> = {}): ActiveSession {
  const full: SessionConfig = { ...DEFAULT_CONFIG, ...config };
  return {
    config: full,
    startedAt: new Date().toISOString(),
    trials: [],
    currentLogMAR: full.startLogMAR,
    levelsPassed: [],
    consecutiveFails: 0,
    finished: false,
    aborted: false,
  };
}

export function saveSession(session: ActiveSession): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadSession(): ActiveSession | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ActiveSession;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function saveResult(result: SessionResultPayload): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
}

export function loadResult(): SessionResultPayload | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(RESULT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionResultPayload;
  } catch {
    return null;
  }
}

export function toResultPayload(
  session: ActiveSession,
  finalLogMAR: number | null,
): SessionResultPayload {
  const summary = buildResultSummary(
    session.trials,
    session.levelsPassed,
    finalLogMAR,
  );
  return {
    version: "1.0",
    startedAt: session.startedAt,
    finishedAt: new Date().toISOString(),
    aborted: session.aborted,
    config: session.config,
    trials: session.trials,
    result: summary,
  };
}

export function downloadJson(payload: SessionResultPayload, filename?: string): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    filename ??
    `avc-result-${payload.config.eye}-${payload.finishedAt.slice(0, 19).replace(/[:T]/g, "-")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function appendTrial(
  session: ActiveSession,
  trial: TrialRecord,
): ActiveSession {
  return { ...session, trials: [...session.trials, trial] };
}
