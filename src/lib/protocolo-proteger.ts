/**
 * Protocolo exacto de Test CINETICA de Proteger / JARVIS
 * Fuente: resources/views/t207armasvision.blade.php
 *   - letras, iniciarCinetica, animarLetra, cinetica
 * Campo destino en JARVIS: t207cinetica (NORMAL | ANORMAL)
 * Criterio PDF: "Agudeza visual cinetica (<=20/60)"
 */

/** Mismos 10 estímulos, mismo orden que Proteger */
export const LETRAS_CINETICA = [
  "E",
  "5",
  "r",
  "T",
  "P",
  "7",
  "b",
  "y",
  "6",
  "M",
] as const;

export type LetraCinetica = (typeof LETRAS_CINETICA)[number];

/** font-size por defecto: 52px bold (modal Proteger). Ajustable solo antes de iniciar. */
export const FONT_SIZE_PX_DEFAULT = 52;
export const FONT_SIZE_PX_MIN = 24;
export const FONT_SIZE_PX_MAX = 120;

/** Ajustes de presentación (no cambian el protocolo de letras/velocidad/umbral). */
export interface AjustesCinetica {
  /** Tamaño de la letra en pantalla (px). Default Proteger: 52 */
  fontSizePx: number;
  /** Amplitud del barrido horizontal. Default Proteger: 800 */
  sweepPx: number;
}

export const AJUSTES_DEFAULT: AjustesCinetica = {
  fontSizePx: FONT_SIZE_PX_DEFAULT,
  sweepPx: 800,
};

/**
 * Velocidad de un tramo horizontal (ida o vuelta).
 * Proteger: let velocidad = 2500;
 *   if ((actual + 1) % 4 == 0 || (actual + 1) % 3 == 0) velocidad = 1300;
 * `actual` es índice 0-based del estímulo actual.
 */
export function velocidadMs(actual: number): number {
  const n = actual + 1;
  if (n % 4 === 0 || n % 3 === 0) {
    return 1300;
  }
  return 2500;
}

/** Reposicionamiento al cambiar letra: left ±(sweep/2) con duration "fast" (~200ms jQuery) */
export const REPOSITION_MS = 200;

export function repositionPx(sweepPx: number): number {
  return Math.round(sweepPx / 2);
}

/**
 * Tras responder el último estímulo (índice 9):
 *   if (correctas > 4) NORMAL else ANORMAL
 */
export function evaluarResultado(correctas: number): "NORMAL" | "ANORMAL" {
  return correctas > 4 ? "NORMAL" : "ANORMAL";
}

export const TOTAL_ENSAYOS = LETRAS_CINETICA.length;
export const UMBRAL_CORRECTAS = 5; // > 4

export interface EnsayoCinetica {
  index: number;
  letra: string;
  correcto: boolean;
  velocidadMs: number;
  respondedAt: string;
}

export interface ResultadoCinetica {
  version: "proteger-cinetica-1.0";
  protocol: "t207-armas-vision-cinetica";
  startedAt: string;
  finishedAt: string;
  aborted: boolean;
  correctas: number;
  total: number;
  resultado: "NORMAL" | "ANORMAL" | "ABORTADO";
  /** Campo equivalente JARVIS t207cinetica */
  t207cinetica: "NORMAL" | "ANORMAL" | "";
  ensayos: EnsayoCinetica[];
  notas: string;
  /** Ajustes de presentación usados en la sesión (fijos al iniciar) */
  ajustes: AjustesCinetica;
}
