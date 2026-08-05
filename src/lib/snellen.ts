/**
 * Convert logMAR to a common Snellen 20/x equivalent string.
 * logMAR = log10(MAR), MAR = denominator/20 for 20/x notation.
 */
export function logMARToSnellen(logMAR: number): string {
  const mar = Math.pow(10, logMAR);
  const denom = Math.round(20 * mar);
  return `20/${denom}`;
}

export function snellenToLogMAR(numerator: number, denominator: number): number {
  return Math.log10(denominator / numerator);
}
