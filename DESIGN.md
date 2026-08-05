# Agudeza Visual Cinemática (AVC) — Design Spec

**Date:** 2026-08-04  
**Status:** Approved for implementation planning  
**Stack:** Next.js (App Router) + TypeScript + Tailwind + Canvas 2D + PWA  
**Location:** New app at workspace root: `avc-app/` (sibling of `JARVIS/`, not inside Laravel)

---

## 1. Problem and goal

Occupational health workflows in JARVIS already cover visiometry (`t48`), optometry (`t42`), CRC vision, and weapons vision, but there is **no module for cinematic (dynamic) visual acuity** — the ability to resolve a moving optotype.

**Goal (v1):** A **standalone React/Next web app** that runs a professional-guided Landolt C motion test, records verbal patient responses (marked by the professional), and reports a cinematic acuity result (logMAR + Snellen equivalent). Offline-capable via PWA. No JARVIS API in v1.

---

## 2. Product decisions (locked)

| Topic | Decision |
|-------|----------|
| Purpose | Interactive on-screen test (not a passive form) |
| Operator | Professional-guided session |
| Stimulus | Landolt C in motion |
| Calibration | Fixed room distance **plus** optional screen PPI calibration (credit-card size) |
| Integration | Standalone v1 (export only; JARVIS later) |
| Patient response | Verbal; **professional** marks direction on pad |
| Tech approach | Next.js + PWA (App Router, TypeScript, Tailwind, Canvas 2D) |

---

## 3. Architecture

### 3.1 High-level

```
UI (App Router)          Domain AVC              Local persistence
/setup                   Landolt engine          sessionStorage
/calibrate               logMAR sizing           export JSON
/test                    motion path             print / PDF-ready view
/result                  scoring                 PWA offline cache
```

No clinical backend, no auth, no multi-patient server history in v1.

### 3.2 Modules (single responsibility)

| Module | Responsibility | Depends on |
|--------|----------------|------------|
| `SessionSetup` | Eye (OD/OI/AO), distance, speed, trial count, start | — |
| `ScreenCalibrator` | Match on-screen rectangle to 85.6 mm card → PPI | browser layout |
| `LandoltCanvas` | Draw Landolt C, animate horizontal path, size from logMAR + distance + PPI | canvas, geometry helpers |
| `ResponsePad` | Four direction buttons for professional input | session state |
| `ScoringEngine` | Correct/incorrect, level pass (≥80%), stop rules, finalLogMAR | pure functions |
| `ResultView` | Summary table, % correct, export JSON, print | session result |
| `sessionStore` | Hold config + trials in memory / sessionStorage | — |

### 3.3 Stack detail

- **Next.js 15** App Router, client components for canvas and interaction
- **TypeScript** strict
- **Tailwind CSS** for chrome UI; stimulus area is canvas (dark background)
- **Canvas 2D** for optotype rendering and motion (not Pixi/WebGL in v1)
- **PWA** via Serwist or equivalent `next-pwa` successor — full test flow offline
- **No API routes** required for clinical data in v1

---

## 4. User flow and UI

### 4.1 Screens

1. **`/setup`** — Select eye, distance (1 / 2 / 3 / 6 m), speed (slow / medium / fast), optional “calibrate screen”, start session  
2. **`/calibrate`** (optional) — Adjust rectangle until width matches a physical credit card (85.60 mm); save PPI  
3. **`/test`** — Countdown → trial loop  
4. **`/result`** — Final metrics + export / print  

### 4.2 Test screen layout

- **Top bar:** eye · distance · current logMAR · trial index · running % correct  
- **Main:** full-width dark canvas; white Landolt C moving horizontally  
- **Bottom:** “Professional: mark the direction the patient says” + arrow pad (↑ ↓ ← →)  
- **Actions:** Pause · Abort (confirm → partial result with `aborted: true`)  

### 4.3 Trial protocol (v1)

| Parameter | Value |
|-----------|--------|
| Trajectory | Horizontal; direction L→R or R→L randomized per trial |
| Gap orientations | 4 (up, down, left, right) |
| Size scale | logMAR steps of 0.1 (e.g. start 1.0 down toward 0.0) |
| Trials per level | Default 5 (configurable in setup) |
| Pass threshold | ≥ 80% correct at level → advance to smaller size |
| Stop | Two consecutive failed levels **or** minimum logMAR reached |
| Result | Last **passed** level as `finalLogMAR` + Snellen equivalent |
| Speed | slow / medium / fast mapped to angular or screen speed scaled with distance |

### 4.4 Geometry (optotype size)

- Standard Landolt C: stroke width and gap related to overall diameter so gap subtends the visual angle for the target logMAR at the chosen distance.  
- Pixel size derived from: **distance (m)**, **logMAR**, **PPI** (calibrated or default 96).  
- If not calibrated, show a persistent banner: result sizes are estimates (default DPI).

---

## 5. Data model

### 5.1 Export schema `SessionResult` v1.0

```json
{
  "version": "1.0",
  "startedAt": "ISO-8601",
  "finishedAt": "ISO-8601",
  "aborted": false,
  "config": {
    "eye": "OD",
    "distanceMeters": 3,
    "speed": "medium",
    "ppi": 96,
    "calibrated": false,
    "trialsPerLevel": 5,
    "passThreshold": 0.8,
    "startLogMAR": 1.0,
    "minLogMAR": 0.0,
    "stepLogMAR": 0.1
  },
  "trials": [
    {
      "levelLogMAR": 0.3,
      "gapDirection": "right",
      "motion": "L2R",
      "response": "right",
      "correct": true,
      "rtMs": 820
    }
  ],
  "result": {
    "finalLogMAR": 0.2,
    "snellenEquivalent": "20/32",
    "percentCorrect": 0.78,
    "levelsPassed": [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2]
  }
}
```

### 5.2 Persistence

- Active session: React state + `sessionStorage` (survive refresh within tab)  
- Export: download `.json`  
- Print: browser print stylesheet on result page (PDF via print-to-PDF)  
- No server write in v1  

---

## 6. Error handling and edge cases

| Case | Behavior |
|------|----------|
| Navigate to `/test` or `/result` without setup | Redirect to `/setup` |
| Abort mid-test | Confirm dialog → `/result` with `aborted: true` and partial trials |
| Very small viewport | Warning: use monitor ≥ 13″ at configured distance |
| PPI not calibrated | Default 96 DPI + “estimation” banner |
| Double response on same trial | Ignore after first valid input |
| Offline | Full flow via PWA; export still local download |
| Pause | Freeze animation and accept no response until resume |

---

## 7. Testing strategy

| Layer | Coverage |
|-------|----------|
| Unit | logMAR ↔ visual angle ↔ pixel size given distance + PPI |
| Unit | `ScoringEngine`: pass threshold, consecutive fails, `finalLogMAR` |
| Unit | Gap direction vs response → correct/incorrect |
| Component | `ResponsePad` emits the chosen direction once per trial |
| Integration / E2E light | setup → inject/mock trials → result JSON shape |
| Manual | Physical card calibration checklist on a real monitor |

---

## 8. Out of scope (v1)

- JARVIS API integration (orders, exam IDs, t48/t42-like tables)  
- Dual-screen / second-monitor-only stimulus  
- 8 gap directions, circular/random paths, head-motion DVA  
- Auth, multi-patient server history  
- Phone as remote stimulus display at 6 m  
- PixiJS/WebGL, clinical certification claims  

---

## 9. Future (phase 2, not v1)

- Bridge to JARVIS: deep link with order/exam token; POST result  
- Optional dual display  
- Additional protocols (Tumbling E, more trajectories)  
- Audit trail and professional user context  

---

## 10. Project layout (proposed)

```
avc-app/
  app/
    layout.tsx
    page.tsx                 # redirect → /setup
    setup/page.tsx
    calibrate/page.tsx
    test/page.tsx
    result/page.tsx
  components/
    SessionSetupForm.tsx
    ScreenCalibrator.tsx
    LandoltCanvas.tsx
    ResponsePad.tsx
    ResultSummary.tsx
  lib/
    geometry.ts              # logMAR, mm, px, Landolt proportions
    scoring.ts
    motion.ts
    session.ts               # types + sessionStorage
    snellen.ts
  public/
    manifest.webmanifest
    icons/
  tests/
```

---

## 11. Success criteria (v1 done when)

1. Professional can complete a full OD (or OI/AO) Landolt motion session offline.  
2. Optotype size changes correctly with distance + PPI (unit-tested).  
3. Scoring matches the pass/stop rules above.  
4. Result screen shows final logMAR + Snellen eq. and downloads valid `SessionResult` JSON.  
5. PWA installs / works offline for the four routes.  
6. Spec behaviors for abort, uncalibrated DPI, and missing setup are implemented.

---

## 12. Non-goals / disclaimer

This app is a **clinical workflow aid and protocol prototype**. v1 does not claim regulatory certification as a medical device. Display calibration quality depends on the operator following distance and card calibration steps.

