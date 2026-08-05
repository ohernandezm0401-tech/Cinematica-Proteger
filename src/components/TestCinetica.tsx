"use client";

/**
 * Clona el comportamiento de:
 *   iniciarCinetica / animarLetra / cinetica en t207armasvision.blade.php
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  FONT_SIZE_PX,
  LETRAS_CINETICA,
  REPOSITION_MS,
  REPOSITION_PX,
  SWEEP_PX,
  TOTAL_ENSAYOS,
  evaluarResultado,
  velocidadMs,
  type EnsayoCinetica,
  type ResultadoCinetica,
} from "@/lib/protocolo-proteger";

interface TestCineticaProps {
  onFinished: (result: ResultadoCinetica) => void;
  onCancel: () => void;
}

export function TestCinetica({ onFinished, onCancel }: TestCineticaProps) {
  const [actual, setActual] = useState(0);
  const [correctas, setCorrectas] = useState(0);
  const [letraVisible, setLetraVisible] = useState(true);
  const [leftPx, setLeftPx] = useState(-REPOSITION_PX);
  const [transitionMs, setTransitionMs] = useState(0);
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

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  /**
   * Equivalente a animarLetra(ida) de Proteger.
   * - Si reiniciar: reposiciona a ±400px "fast", muestra letra, arranca animación
   * - Si no: mueve ±800px a velocidad del estímulo actual, luego invierte sentido
   */
  const animarLetra = useCallback((ida: boolean) => {
    if (pararRef.current) return;
    const gen = animGenRef.current;

    if (reiniciarRef.current) {
      reiniciarRef.current = false;
      // if ((actual + 1) % 2 == 0) start from +400 going left (ida=false)
      // else start from -400 going right (ida=true)
      const even = (actualRef.current + 1) % 2 === 0;
      const startLeft = even ? REPOSITION_PX : -REPOSITION_PX;
      const nextIda = !even; // even → animarLetra(false); odd → animarLetra(true)

      setLetraVisible(false);
      setTransitionMs(0);
      setLeftPx(startLeft);

      timerRef.current = setTimeout(() => {
        if (animGenRef.current !== gen || pararRef.current) return;
        setLetraVisible(true);
        // jQuery "fast" reposition then call animarLetra
        timerRef.current = setTimeout(() => {
          if (animGenRef.current !== gen || pararRef.current) return;
          animarLetra(nextIda);
        }, REPOSITION_MS);
      }, 16);
      return;
    }

    idaRef.current = ida;
    const vel = velocidadMs(actualRef.current);
    setTransitionMs(vel);
    setLeftPx((prev) => (ida ? prev + SWEEP_PX : prev - SWEEP_PX));

    timerRef.current = setTimeout(() => {
      if (animGenRef.current !== gen || pararRef.current) return;
      animarLetra(!ida);
    }, vel);
  }, []);

  // Inicio = iniciarCinetica()
  useEffect(() => {
    pararRef.current = false;
    animGenRef.current += 1;
    actualRef.current = 0;
    correctasRef.current = 0;
    ensayosRef.current = [];
    startedAtRef.current = new Date().toISOString();
    setActual(0);
    setCorrectas(0);
    setRunning(true);
    setLetraVisible(true);
    setTransitionMs(REPOSITION_MS);
    setLeftPx(-REPOSITION_PX);

    // $("#letra-cinetica").animate({ left: "-400px" }, "fast", () => animarLetra(true));
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

    // if (actual < letras.length - 1) actual += 1; else finish
    if (idx < TOTAL_ENSAYOS - 1) {
      actualRef.current = idx + 1;
      setActual(actualRef.current);
      reiniciarRef.current = true;
      setLetraVisible(false);
      // La animación en curso terminará y verá reiniciar, o forzamos ciclo:
      // En Proteger: reiniciar=true y al siguiente callback de animate se reposiciona.
      // Aquí interrumpimos el tramo actual y reposicionamos de inmediato.
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
        notas:
          "Clon del Test CINETICA de Proteger (t207armasvision). Umbral: correctas > 4 → NORMAL. PDF referencia: agudeza visual cinetica (<=20/60).",
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
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-400">
        <span>Test CINETICA · protocolo Proteger (t207)</span>
        <span>
          Estímulo {actual + 1}/{TOTAL_ENSAYOS} · Correctas ({correctas})
        </span>
      </header>

      {/* Área de animación — modal Proteger: height 200px, padding-top 80px, font 52px bold */}
      <div className="relative flex min-h-[280px] flex-1 items-start justify-center overflow-hidden bg-white pt-20">
        <span
          className="select-none font-bold text-black"
          style={{
            fontSize: FONT_SIZE_PX,
            position: "relative",
            left: leftPx,
            display: letraVisible ? "inline-block" : "none",
            transition:
              transitionMs > 0
                ? `left ${transitionMs}ms linear`
                : "none",
          }}
          aria-label={`Estímulo ${letra}`}
        >
          {letra}
        </span>
      </div>

      <footer className="border-t border-slate-800 bg-slate-900 px-4 py-6">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled={!running}
            onClick={() => responder(true)}
            className="rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-40"
          >
            Respuesta correcta ({correctas})
          </button>
          <button
            type="button"
            disabled={!running}
            onClick={() => responder(false)}
            className="rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-40"
          >
            Respuesta incorrecta
          </button>
        </div>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={abortar}
            className="rounded-lg border border-amber-600 px-4 py-2 text-xs text-amber-400 hover:bg-amber-950"
          >
            Cancelar
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">
          Letras: E 5 r T P 7 b y 6 M · Velocidad 2500 ms / 1300 ms · NORMAL si
          correctas &gt; 4
        </p>
      </footer>
    </div>
  );
}
