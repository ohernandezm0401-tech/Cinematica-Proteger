import type { ResultadoCinetica } from "./protocolo-proteger";

const RESULT_KEY = "avc-cinetica-result-v1";

export function saveResult(result: ResultadoCinetica): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
}

export function loadResult(): ResultadoCinetica | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(RESULT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ResultadoCinetica;
  } catch {
    return null;
  }
}

export function clearResult(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(RESULT_KEY);
}

export function downloadJson(payload: ResultadoCinetica): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cinetica-proteger-${payload.finishedAt.slice(0, 19).replace(/[:T]/g, "-")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
