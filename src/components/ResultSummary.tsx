"use client";

import type { SessionResultPayload } from "@/lib/types";
import { downloadJson } from "@/lib/session";

interface ResultSummaryProps {
  payload: SessionResultPayload;
}

export function ResultSummary({ payload }: ResultSummaryProps) {
  const { config, result, trials, aborted } = payload;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 print:max-w-none">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">
          Resultado AVC
        </h1>
        {aborted && (
          <p className="mt-1 text-sm text-amber-400">
            Sesión abortada — resultado parcial
          </p>
        )}
        <p className="mt-2 text-sm text-slate-400">
          {config.eye} · {config.distanceMeters} m · velocidad {config.speed}
          {config.calibrated
            ? ` · PPI calibrado ${config.ppi}`
            : " · PPI estimado 96 (sin calibrar)"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Metric
          label="logMAR final"
          value={
            result.finalLogMAR === null
              ? "—"
              : result.finalLogMAR.toFixed(1)
          }
        />
        <Metric
          label="Snellen eq."
          value={result.snellenEquivalent ?? "—"}
        />
        <Metric
          label="% aciertos"
          value={`${Math.round(result.percentCorrect * 100)}%`}
        />
        <Metric label="Ensayos" value={String(trials.length)} />
        <Metric
          label="Niveles superados"
          value={String(result.levelsPassed.length)}
        />
        <Metric
          label="Estado"
          value={aborted ? "Abortada" : "Completa"}
        />
      </div>

      {result.levelsPassed.length > 0 && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-300">
          <p className="mb-2 font-medium text-slate-200">Niveles pasados</p>
          <p className="font-mono text-xs">
            {result.levelsPassed.map((l) => l.toFixed(1)).join(" → ")}
          </p>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800 text-slate-400">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">logMAR</th>
              <th className="px-3 py-2">Gap</th>
              <th className="px-3 py-2">Resp.</th>
              <th className="px-3 py-2">OK</th>
              <th className="px-3 py-2">ms</th>
            </tr>
          </thead>
          <tbody>
            {trials.map((t, i) => (
              <tr key={i} className="border-t border-slate-800">
                <td className="px-3 py-1.5">{i + 1}</td>
                <td className="px-3 py-1.5">{t.levelLogMAR.toFixed(1)}</td>
                <td className="px-3 py-1.5">{t.gapDirection}</td>
                <td className="px-3 py-1.5">{t.response}</td>
                <td className="px-3 py-1.5">{t.correct ? "✓" : "✗"}</td>
                <td className="px-3 py-1.5">{t.rtMs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3 print:hidden">
        <button
          type="button"
          onClick={() => downloadJson(payload)}
          className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-500"
        >
          Exportar JSON
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl border border-slate-600 px-5 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
        >
          Imprimir / PDF
        </button>
        <a
          href="/setup"
          className="rounded-xl border border-slate-600 px-5 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
        >
          Nueva sesión
        </a>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-100">{value}</p>
    </div>
  );
}
