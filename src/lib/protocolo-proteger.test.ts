import assert from "node:assert/strict";
import {
  LETRAS_CINETICA,
  evaluarResultado,
  velocidadMs,
  TOTAL_ENSAYOS,
} from "./protocolo-proteger";

assert.deepEqual(
  [...LETRAS_CINETICA],
  ["E", "5", "r", "T", "P", "7", "b", "y", "6", "M"],
);
assert.equal(TOTAL_ENSAYOS, 10);

// actual 0 → n=1: 2500
assert.equal(velocidadMs(0), 2500);
// actual 1 → n=2: 2500
assert.equal(velocidadMs(1), 2500);
// actual 2 → n=3: %3 → 1300
assert.equal(velocidadMs(2), 1300);
// actual 3 → n=4: %4 → 1300
assert.equal(velocidadMs(3), 1300);
// actual 4 → n=5: 2500
assert.equal(velocidadMs(4), 2500);
// actual 5 → n=6: %3 → 1300
assert.equal(velocidadMs(5), 1300);
// actual 6 → n=7: 2500
assert.equal(velocidadMs(6), 2500);
// actual 7 → n=8: %4 → 1300
assert.equal(velocidadMs(7), 1300);
// actual 8 → n=9: %3 → 1300
assert.equal(velocidadMs(8), 1300);
// actual 9 → n=10: 2500
assert.equal(velocidadMs(9), 2500);

assert.equal(evaluarResultado(5), "NORMAL");
assert.equal(evaluarResultado(4), "ANORMAL");
assert.equal(evaluarResultado(0), "ANORMAL");
assert.equal(evaluarResultado(10), "NORMAL");

console.log("protocolo-proteger.test.ts: OK");
