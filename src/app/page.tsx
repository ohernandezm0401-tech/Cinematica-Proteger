"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { TestCinetica } from "@/components/TestCinetica";
import { ResultadoCineticaView } from "@/components/ResultadoCinetica";
import { saveResult } from "@/lib/session";
import type { AjustesCinetica, ResultadoCinetica } from "@/lib/protocolo-proteger";
import {
  AJUSTES_DEFAULT,
  FONT_SIZE_PX_DEFAULT,
  FONT_SIZE_PX_MAX,
  FONT_SIZE_PX_MIN,
  LETRAS_CINETICA,
  TOTAL_ENSAYOS,
  UMBRAL_CORRECTAS,
} from "@/lib/protocolo-proteger";

type Phase = "home" | "config" | "test" | "result";

export default function HomePage() {
  const [phase, setPhase] = useState<Phase>("home");
  const [result, setResult] = useState<ResultadoCinetica | null>(null);
  const [fontSizePx, setFontSizePx] = useState(FONT_SIZE_PX_DEFAULT);
  const [sweepPx, setSweepPx] = useState(AJUSTES_DEFAULT.sweepPx);

  const ajustes: AjustesCinetica = useMemo(
    () => ({ fontSizePx, sweepPx }),
    [fontSizePx, sweepPx],
  );

  if (phase === "test") {
    return (
      <main className="flex min-h-full flex-1 flex-col">
        <TestCinetica
          ajustes={ajustes}
          onFinished={(r) => {
            saveResult(r);
            setResult(r);
            setPhase("result");
          }}
          onCancel={() => setPhase("home")}
        />
      </main>
    );
  }

  if (phase === "result" && result) {
    return (
      <main className="flex min-h-full flex-1 flex-col">
        <ResultadoCineticaView
          payload={result}
          onNueva={() => {
            setResult(null);
            setPhase("home");
          }}
        />
      </main>
    );
  }

  if (phase === "config") {
    return (
      <main className="flex flex-1 flex-col items-center px-4 py-12">
        <div className="mx-auto w-full max-w-lg">
          <div className="mb-4 flex justify-center">
            <div className="rounded bg-white px-3 py-2">
              <Image
                src="/logo-proteger.png"
                alt="Proteger IPS"
                width={160}
                height={50}
                className="h-10 w-auto object-contain"
                priority
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Antes de la prueba
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-100">
              Configurar tamaños
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Opcional. Si no configura, al iniciar se usan los valores por
              defecto de Proteger (52 px / barrido 800 px).
            </p>
          </div>

          <section className="mt-8 rounded border border-slate-700 bg-slate-900/80 p-5">
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              <span className="flex justify-between">
                <span>Tamaño de la letra</span>
                <span className="font-mono tabular-nums text-slate-100">
                  {fontSizePx} px
                </span>
              </span>
              <input
                type="range"
                min={FONT_SIZE_PX_MIN}
                max={FONT_SIZE_PX_MAX}
                step={1}
                value={fontSizePx}
                onChange={(e) => setFontSizePx(Number(e.target.value))}
                className="w-full accent-slate-400"
              />
              <span className="flex justify-between text-[11px] text-slate-500">
                <span>{FONT_SIZE_PX_MIN} px</span>
                <button
                  type="button"
                  className="underline hover:text-slate-300"
                  onClick={() => setFontSizePx(FONT_SIZE_PX_DEFAULT)}
                >
                  Restablecer 52 px
                </button>
                <span>{FONT_SIZE_PX_MAX} px</span>
              </span>
            </label>

            <div className="mt-4 flex h-28 items-center justify-center overflow-hidden rounded border border-slate-600 bg-white">
              <span
                className="select-none font-bold text-black"
                style={{ fontSize: fontSizePx }}
              >
                E
              </span>
            </div>

            <label className="mt-5 flex flex-col gap-2 text-sm text-slate-300">
              <span className="flex justify-between">
                <span>Amplitud del barrido</span>
                <span className="font-mono tabular-nums text-slate-100">
                  {sweepPx} px
                </span>
              </span>
              <input
                type="range"
                min={400}
                max={1200}
                step={50}
                value={sweepPx}
                onChange={(e) => setSweepPx(Number(e.target.value))}
                className="w-full accent-slate-400"
              />
              <span className="flex justify-between text-[11px] text-slate-500">
                <span>400</span>
                <button
                  type="button"
                  className="underline hover:text-slate-300"
                  onClick={() => setSweepPx(800)}
                >
                  Restablecer 800 px
                </button>
                <span>1200</span>
              </span>
            </label>
          </section>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setPhase("home")}
              className="flex-1 rounded border border-slate-600 px-5 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              Volver
            </button>
            <button
              type="button"
              onClick={() => setPhase("test")}
              className="flex-1 rounded border border-slate-500 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-white"
            >
              Guardar e iniciar
            </button>
          </div>
        </div>
      </main>
    );
  }

  // home: dos botones — Iniciar siempre arranca; Configurar es opcional
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded bg-white px-4 py-3 shadow-sm">
            <Image
              src="/logo-proteger.png"
              alt="Proteger IPS"
              width={200}
              height={64}
              className="h-14 w-auto object-contain"
              priority
            />
          </div>
        </div>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
          Proteger IPS · Protocolo t207
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-100">
          Test CINETICA
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Agudeza visual cinética. Puede iniciar de inmediato o configurar
          tamaños antes.
        </p>

        <dl className="mt-6 grid grid-cols-1 gap-2 text-left text-xs text-slate-400">
          <div className="rounded border border-slate-800 px-3 py-2">
            <dt className="text-slate-500">Letras</dt>
            <dd className="mt-0.5 font-mono text-sm text-slate-200">
              {LETRAS_CINETICA.join(" ")}
            </dd>
          </div>
          <div className="rounded border border-slate-800 px-3 py-2">
            <dt className="text-slate-500">Umbral · presentación actual</dt>
            <dd className="mt-0.5 text-slate-200">
              {TOTAL_ENSAYOS} ensayos · &gt;{UMBRAL_CORRECTAS - 1} → NORMAL ·{" "}
              {fontSizePx} px / barrido {sweepPx} px
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setPhase("test")}
            className="w-full rounded border border-slate-500 bg-slate-100 px-6 py-3.5 text-sm font-semibold text-slate-900 hover:bg-white"
          >
            Iniciar
          </button>
          <button
            type="button"
            onClick={() => setPhase("config")}
            className="w-full rounded border border-slate-600 bg-transparent px-6 py-3.5 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Configurar
          </button>
        </div>

        <p className="mt-4 text-[11px] text-slate-500">
          Si pulsa Iniciar sin configurar, la prueba arranca con los valores
          actuales (por defecto Proteger: 52 px / 800 px).
        </p>
      </div>
    </main>
  );
}
