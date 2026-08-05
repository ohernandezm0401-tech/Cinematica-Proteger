import assert from "node:assert/strict";
import {
  diameterMmForLogMAR,
  gapMmForLogMAR,
  mmToPx,
  ppiFromCardWidthPx,
  diameterPxForLogMAR,
} from "./geometry";

// logMAR 0 at 6 m: gap = 1 arcmin
const gap0 = gapMmForLogMAR(0, 6);
// 6m * tan(1') ≈ 1.745 mm
assert.ok(Math.abs(gap0 - 1.74533) < 0.02, `gap0=${gap0}`);

const diam0 = diameterMmForLogMAR(0, 6);
assert.ok(Math.abs(diam0 - 5 * gap0) < 1e-9);

// logMAR 1.0 is 10× larger gap
const gap1 = gapMmForLogMAR(1, 6);
assert.ok(Math.abs(gap1 / gap0 - 10) < 0.01);

// mm → px at 96 PPI: 25.4 mm = 96 px
assert.equal(Math.round(mmToPx(25.4, 96)), 96);

// credit card calibration: if 85.6 mm shows as 323.5 px → ~96 PPI
const ppi = ppiFromCardWidthPx((85.6 * 96) / 25.4);
assert.ok(Math.abs(ppi - 96) < 0.5);

const px = diameterPxForLogMAR(0, 3, 96);
assert.ok(px > 0);

console.log("geometry.test.ts: OK");
