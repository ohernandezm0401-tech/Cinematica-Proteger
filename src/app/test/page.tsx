"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LandoltCanvas } from "@/components/LandoltCanvas";
import { ResponsePad } from "@/components/ResponsePad";
import { randomDirection, randomMotion } from "@/lib/motion";
import {
  afterLevelComplete,
  evaluateLevel,
  isCorrect,
  roundLogMAR,
} from "@/lib/scoring";
import {
  loadSession,
  saveResult,
  saveSession,
  toResultPayload,
} from "@/lib/session";
import type {
  ActiveSession,
  Direction,
  MotionDirection,
} from "@/lib/types";

type Phase = "countdown" | "trial" | "waiting";

export default function TestPage() {
  const router = useRouter();
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [phase, setPhase] = useState<Phase>("countdown");
  const [countdown, setCountdown] = useState(3);
  const [paused, setPaused] = useState(false);
  const [gap, setGap] = useState<Direction>("right");
  const [motion, setMotion] = useState<MotionDirection>("L2R");
  const [trialKey, setTrialKey] = useState(0);
  const [blockCount, setBlockCount] = useState(0);
  const trialStartedAt = useRef(0);
  const responded = useRef(false);

  const finish = useCallback(
    (s: ActiveSession, finalLogMAR: number | null, aborted: boolean) => {
      const done = { ...s, finished: true, aborted };
      const payload = toResultPayload(done, finalLogMAR);
      saveResult(payload);
      saveSession(done);
      router.push("/result");
    },
    [router],
  );

  useEffect(() => {
    const s = loadSession();
    if (!s) {
      router.replace("/setup");
      return;
    }
    if (s.finished) {
      router.replace("/result");
      return;
    }
    setSession(s);
  }, [router]);

  // Countdown
  useEffect(() => {
    if (!session || phase !== "countdown" || paused) return;
    if (countdown <= 0) {
      startTrial();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, phase, countdown, paused]);

  const startTrial = () => {
    responded.current = false;
    setGap(randomDirection());
    setMotion(randomMotion());
    setTrialKey((k) => k + 1);
    trialStartedAt.current = performance.now();
    setPhase("trial");
  };

  const onRespond = (response: Direction) => {
    if (!session || phase !== "trial" || paused || responded.current) return;
    responded.current = true;

    const rtMs = Math.round(performance.now() - trialStartedAt.current);
    const trial = {
      levelLogMAR: roundLogMAR(session.currentLogMAR),
      gapDirection: gap,
      motion,
      response,
      correct: isCorrect(gap, response),
      rtMs,
    };

    const trials = [...session.trials, trial];
    const blockTrials = blockCount + 1;
    let nextSession: ActiveSession = { ...session, trials };

    const n = session.config.trialsPerLevel;
    if (blockTrials < n) {
      setBlockCount(blockTrials);
      saveSession(nextSession);
      setSession(nextSession);
      setPhase("waiting");
      setTimeout(() => {
        if (!responded.current) return;
        startTrial();
      }, 400);
      return;
    }

    // Level block complete
    const outcome = evaluateLevel(
      trials,
      session.currentLogMAR,
      session.config.passThreshold,
      n,
    );
    const progress = afterLevelComplete(
      session.config,
      session.currentLogMAR,
      session.levelsPassed,
      session.consecutiveFails,
      outcome.passed,
    );

    nextSession = {
      ...nextSession,
      levelsPassed: progress.levelsPassed,
      consecutiveFails: progress.consecutiveFails,
      currentLogMAR: progress.nextLogMAR ?? session.currentLogMAR,
      finished: progress.finished,
    };

    if (progress.finished) {
      finish(nextSession, progress.finalLogMAR, false);
      return;
    }

    setBlockCount(0);
    saveSession(nextSession);
    setSession(nextSession);
    setPhase("waiting");
    setTimeout(() => startTrial(), 500);
  };

  const onAbort = () => {
    if (!session) return;
    if (!window.confirm("¿Abortar la prueba y ver resultado parcial?")) return;
    const final =
      session.levelsPassed.length > 0
        ? session.levelsPassed[session.levelsPassed.length - 1]!
        : null;
    finish(session, final, true);
  };

  if (!session) {
    return (
      <main className="flex flex-1 items-center justify-center text-slate-400">
        Cargando sesión…
      </main>
    );
  }

  const correct = session.trials.filter((t) => t.correct).length;
  const pct =
    session.trials.length === 0
      ? 0
      : Math.round((correct / session.trials.length) * 100);

  return (
    <main className="flex flex-1 flex-col bg-slate-950">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-400">
        <span>
          {session.config.eye} · {session.config.distanceMeters} m · logMAR{" "}
          {session.currentLogMAR.toFixed(1)}
          {!session.config.calibrated && (
            <span className="ml-2 text-amber-400">· PPI estimado</span>
          )}
        </span>
        <span>
          Ensayo {blockCount + (phase === "trial" ? 1 : 0)}/
          {session.config.trialsPerLevel} · total {session.trials.length} ·{" "}
          {pct}% aciertos
        </span>
      </header>

      <div className="relative min-h-[280px] flex-1">
        {phase === "countdown" ? (
          <div className="flex h-full min-h-[280px] items-center justify-center bg-slate-950">
            <p className="text-7xl font-bold text-sky-400">{countdown}</p>
          </div>
        ) : (
          <LandoltCanvas
            logMAR={session.currentLogMAR}
            distanceMeters={session.config.distanceMeters}
            ppi={session.config.ppi}
            gapDirection={gap}
            motion={motion}
            speed={session.config.speed}
            running={phase === "trial" && !paused}
            trialKey={trialKey}
          />
        )}
      </div>

      <footer className="border-t border-slate-800 bg-slate-900 px-4 py-4">
        <ResponsePad
          disabled={phase !== "trial" || paused}
          onRespond={onRespond}
        />
        <div className="mt-4 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="rounded-lg border border-slate-600 px-4 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
          >
            {paused ? "Reanudar" : "Pausar"}
          </button>
          <button
            type="button"
            onClick={onAbort}
            className="rounded-lg border border-red-900 px-4 py-1.5 text-xs text-red-400 hover:bg-red-950"
          >
            Abortar
          </button>
        </div>
      </footer>
    </main>
  );
}
