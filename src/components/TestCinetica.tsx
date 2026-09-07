"use client";

/**
 * Clona el comportamiento de:
 *   iniciarCinetica / animarLetra / cinetica en t207armasvision.blade.php
 * Tamaño/amplitud se fijan al iniciar (ajustes); no se cambian durante la prueba.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LETRAS_CINETICA,
  REPOSITION_MS,
  TOTAL_ENSAYOS,
  evaluarResultado,
  repositionPx,
  velocidadMs,
  type AjustesCinetica,
  type EnsayoCinetica,
  type ResultadoCinetica,
} from "@/lib/protocolo-proteger";

interface TestCineticaProps {
  ajustes: AjustesCinetica;
  onFinished: (result: ResultadoCinetica) => void;
  onCancel: () => void;
}

export function TestCinetica({
  ajustes,
  onFinished,
  onCancel,
}: TestCineticaProps) {
  const sweepPx = ajustes.sweepPx;
  const repoPx = repositionPx(sweepPx);

  const [actual, setActual] = useState(0);
  const [correctas, setCorrectas] = useState(0);
  const [letraVisible, setLetraVisible] = useState(true);
  const [leftPx, setLeftPx] = useState(-repoPx);
  const [transitionMs, setTransitionMs] = useState(REPOSITION_MS);
  const [running, setRunning] = useState(true);

  const actualRef = useRef(0);
  const correctasRef = useRef(0);
  const ensayosRef = useRef<EnsayoCinetica[]>([]);
  const startedAtRef = useRef(new Date().toISOString());
  const pararRef = useRef(false);
  const reiniciarRef = useRef(false);
  const idaRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animGenRef = useRef(0);
  const ajustesRef = useRef(ajustes);
  const animarLetraRef = useRef<(ida: boolean) => void>(() => {});

  useEffect(() => {
    ajustesRef.current = ajustes;
  }, [ajustes]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const animarLetra = useCallback((ida: boolean) => {
    if (pararRef.current) return;
    const gen = animGenRef.current;
    const sweep = ajustesRef.current.sweepPx;
    const repo = repositionPx(sweep);

    if (reiniciarRef.current) {
      reiniciarRef.current = false;
      const even = (actualRef.current + 1) % 2 === 0;
      const startLeft = even ? repo : -repo;
      const nextIda = !even;

      setLetraVisible(false);
      setTransitionMs(0);
      setLeftPx(startLeft);

      timerRef.current = setTimeout(() => {
        if (animGenRef.current !== gen || pararRef.current) return;
        setLetraVisible(true);
        timerRef.current = setTimeout(() => {
          if (animGenRef.current !== gen || pararRef.current) return;
          animarLetraRef.current(nextIda);
        }, REPOSITION_MS);
      }, 16);
      return;
    }

    idaRef.current = ida;
    const vel = velocidadMs(actualRef.current);
    setTransitionMs(vel);
    setLeftPx((prev) => (ida ? prev + sweep : prev - sweep));

    timerRef.current = setTimeout(() => {
      if (animGenRef.current !== gen || pararRef.current) return;
      animarLetraRef.current(!ida);
    }, vel);
  }, []);

  useEffect(() => {
    animarLetraRef.current = animarLetra;
  }, [animarLetra]);

  useEffect(() => {
    pararRef.current = false;
    animGenRef.current += 1;
    actualRef.current = 0;
    correctasRef.current = 0;
    ensayosRef.current = [];
    startedAtRef.current = new Date().toISOString();

    const gen = animGenRef.current;
    timerRef.current = setTimeout(() => {
      if (animGenRef.current !== gen) return;
      animarLetra(true);
    }, REPOSITION_MS);

    return () => {
      pararRef.current = true;
      clearTimer();
    };
  }, [animarLetra]);

  const responder = (correcto: boolean) => {
    if (!running) return;

    const idx = actualRef.current;
    const letra = LETRAS_CINETICA[idx]!;
    if (correcto) {
      correctasRef.current += 1;
      setCorrectas(correctasRef.current);
    }

    ensayosRef.current.push({
      index: idx,
      letra,
      correcto,
      velocidadMs: velocidadMs(idx),
      respondedAt: new Date().toISOString(),
    });

    if (idx < TOTAL_ENSAYOS - 1) {
      actualRef.current = idx + 1;
      setActual(actualRef.current);
      reiniciarRef.current = true;
      setLetraVisible(false);
      clearTimer();
      animGenRef.current += 1;
      animarLetra(idaRef.current);
    } else {
      pararRef.current = true;
      clearTimer();
      setRunning(false);
      setLetraVisible(false);
      const resultado = evaluarResultado(correctasRef.current);
      const payload: ResultadoCinetica = {
        version: "proteger-cinetica-1.0",
        protocol: "t207-armas-vision-cinetica",
        startedAt: startedAtRef.current,
        finishedAt: new Date().toISOString(),
        aborted: false,
        correctas: correctasRef.current,
        total: TOTAL_ENSAYOS,
        resultado,
        t207cinetica: resultado,
        ensayos: [...ensayosRef.current],
        ajustes: { ...ajustesRef.current },
        notas:
          "Protocolo Test CINETICA Proteger (t207armasvision). Umbral: correctas > 4 → NORMAL. Referencia PDF: agudeza visual cinetica (<=20/60).",
      };
      onFinished(payload);
    }
  };

  const abortar = () => {
    pararRef.current = true;
    clearTimer();
    setRunning(false);
    onCancel();
  };

  const letra = LETRAS_CINETICA[actual] ?? "";

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-400">
        <span>Test CINETICA · Proteger (t207)</span>
        <span>
          Estímulo {actual + 1}/{TOTAL_ENSAYOS} · Correctas ({correctas}) ·{" "}
          {ajustes.fontSizePx}px
        </span>
      </header>

      <div className="relative flex min-h-[280px] flex-1 items-start justify-center overflow-hidden bg-white pt-20">
        <span
          className="select-none font-bold text-black"
          style={{
            fontSize: ajustes.fontSizePx,
            position: "relative",
            left: leftPx,
            display: letraVisible ? "inline-block" : "none",
            transition:
              transitionMs > 0 ? `left ${transitionMs}ms linear` : "none",
          }}
          aria-label={`Estímulo ${letra}`}
        >
          {letra}
        </span>
      </div>

      <footer className="border-t border-slate-700 bg-slate-900 px-4 py-6">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled={!running}
            onClick={() => responder(true)}
            className="rounded border border-green-800 bg-green-700 px-6 py-3 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-40"
          >
            Respuesta correcta ({correctas})
          </button>
          <button
            type="button"
            disabled={!running}
            onClick={() => responder(false)}
            className="rounded border border-red-900 bg-red-800 px-6 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
          >
            Respuesta incorrecta
          </button>
        </div>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={abortar}
            className="rounded border border-slate-600 px-4 py-2 text-xs text-slate-400 hover:bg-slate-800"
          >
            Cancelar
          </button>
        </div>
      </footer>
    </div>
  );
}
