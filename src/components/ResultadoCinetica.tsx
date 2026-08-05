"use client";

import type { ResultadoCinetica as Payload } from "@/lib/protocolo-proteger";
import { downloadJson } from "@/lib/session";

interface Props {
  payload: Payload;
  onNueva: () => void;
}

export function ResultadoCineticaView({ payload, onNueva }: Props) {
  const ok = payload.resultado === "NORMAL";

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">
          Resultado — Visión Cinética
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Protocolo Proteger · campo <code className="text-sky-400">t207cinetica</code>
        </p>
      </div>

      <div
        className={`rounded-2xl border p-6 text-center ${
          ok
            ? "border-green-700 bg-green-950/40"
            : payload.resultado === "ABORTADO"
              ? "border-amber-700 bg-amber-950/40"
              : "border-red-700 bg-red-950/40"
        }`}
      >
        <p className="text-xs uppercase tracking-widest text-slate-400">
          t207cinetica
        </p>
        <p
          className={`mt-2 text-4xl font-bold ${
            ok
              ? "text-green-400"
              : payload.resultado === "ABORTADO"
                ? "text-amber-400"
                : "text-red-400"
          }`}
        >
          {payload.t207cinetica || payload.resultado}
        </p>
        <p className="mt-3 text-sm text-slate-300">
          Correctas: <strong>{payload.correctas}</strong> / {payload.total}
          <span className="text-slate-500">
            {" "}
            (umbral Proteger: &gt; 4 → NORMAL)
          </span>
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800 text-slate-400">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Letra</th>
              <th className="px-3 py-2">Velocidad</th>
              <th className="px-3 py-2">OK</th>
            </tr>
          </thead>
          <tbody>
            {payload.ensayos.map((e) => (
              <tr key={e.index} className="border-t border-slate-800">
                <td className="px-3 py-1.5">{e.index + 1}</td>
                <td className="px-3 py-1.5 font-mono text-base font-bold">
                  {e.letra}
                </td>
                <td className="px-3 py-1.5">{e.velocidadMs} ms</td>
                <td className="px-3 py-1.5">
                  {e.correcto ? (
                    <span className="text-green-400">Correcta</span>
                  ) : (
                    <span className="text-red-400">Incorrecta</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500">{payload.notas}</p>

      <div className="flex flex-wrap gap-3">
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
          Imprimir
        </button>
        <button
          type="button"
          onClick={onNueva}
          className="rounded-xl border border-slate-600 px-5 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
        >
          Nueva prueba
        </button>
      </div>
    </div>
  );
}
