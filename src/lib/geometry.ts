/**
 * Landolt C geometry for cinematic visual acuity.
 *
 * Standard proportions: outer diameter = 5 units, stroke = 1 unit, gap = 1 unit.
 * At logMAR 0.0 (20/20), the gap subtends 1 arcminute at the test distance.
 */

/** Gap size in millimeters for a given logMAR and viewing distance (meters). */
export function gapMmForLogMAR(logMAR: number, distanceMeters: number): number {
  const marArcmin = Math.pow(10, logMAR);
  const marRadians = (marArcmin / 60) * (Math.PI / 180);
  return distanceMeters * 1000 * Math.tan(marRadians);
}

/** Outer diameter of Landolt C in mm (5 × gap). */
export function diameterMmForLogMAR(
  logMAR: number,
  distanceMeters: number,
): number {
  return 5 * gapMmForLogMAR(logMAR, distanceMeters);
}

/** Convert millimeters to CSS/canvas pixels using PPI. */
export function mmToPx(mm: number, ppi: number): number {
  return (mm * ppi) / 25.4;
}

/** Outer diameter in pixels for canvas rendering. */
export function diameterPxForLogMAR(
  logMAR: number,
  distanceMeters: number,
  ppi: number,
): number {
  return mmToPx(diameterMmForLogMAR(logMAR, distanceMeters), ppi);
}

/** Stroke (and gap) width in pixels. */
export function strokePxForLogMAR(
  logMAR: number,
  distanceMeters: number,
  ppi: number,
): number {
  return mmToPx(gapMmForLogMAR(logMAR, distanceMeters), ppi);
}

/**
 * PPI from on-screen width in CSS pixels that matches a physical credit card
 * of known width (default 85.6 mm).
 */
export function ppiFromCardWidthPx(
  cardWidthPx: number,
  cardWidthMm = 85.6,
): number {
  if (cardWidthPx <= 0) return 96;
  return (cardWidthPx * 25.4) / cardWidthMm;
}
