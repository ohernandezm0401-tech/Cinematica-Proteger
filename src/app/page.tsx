"use client";

import { useState } from "react";
import { TestCinetica } from "@/components/TestCinetica";
import { ResultadoCineticaView } from "@/components/ResultadoCinetica";
import { saveResult } from "@/lib/session";
import type { ResultadoCinetica } from "@/lib/protocolo-proteger";
import {
  LETRAS_CINETICA,
  TOTAL_ENSAYOS,
  UMBRAL_CORRECTAS,
} from "@/lib/protocolo-proteger";

type Phase = "home" | "test" | "result";

export default function HomePage() {
  const [phase, setPhase] = useState<Phase>("home");
  const [result, setResult] = useState<ResultadoCinetica | null>(null);

  if (phase === "test") {
    return (
      <main className="flex min-h-full flex-1 flex-col">
        <TestCinetica
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

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-lg text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-sky-400">
          Protocolo Proteger · t207 armas visión
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-100">
          Test CINETICA
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Clon al pie de la letra del test de visión cinética de JARVIS
          (agudeza visual cinemática / cinética). Mismas letras, velocidades y
          criterio NORMAL / ANORMAL.
        </p>

        <dl className="mt-8 grid grid-cols-1 gap-3 text-left text-sm sm:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <dt className="text-xs text-slate-500">Letras (orden fijo)</dt>
            <dd className="mt-1 font-mono text-lg font-bold tracking-wider text-slate-100">
              {LETRAS_CINETICA.join(" ")}
            </dd>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <dt className="text-xs text-slate-500">Ensayos / umbral</dt>
            <dd className="mt-1 text-slate-100">
              {TOTAL_ENSAYOS} estímulos · &gt;{UMBRAL_CORRECTAS - 1} correctas →
              NORMAL
            </dd>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <dt className="text-xs text-slate-500">Velocidad</dt>
            <dd className="mt-1 text-slate-100">
              2500 ms / 1300 ms (si n%3=0 o n%4=0)
            </dd>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <dt className="text-xs text-slate-500">Respuesta</dt>
            <dd className="mt-1 text-slate-100">
              Profesional: correcta / incorrecta
            </dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={() => setPhase("test")}
          className="mt-10 rounded-xl bg-green-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-green-500"
        >
          Iniciar Test CINETICA
        </button>
      </div>
    </main>
  );
}
