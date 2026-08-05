"use client";

import Image from "next/image";
import type { ResultadoCinetica as Payload } from "@/lib/protocolo-proteger";
import { downloadJson } from "@/lib/session";

interface Props {
  payload: Payload;
  onNueva: () => void;
}

function formatFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-CO", {
      dateStyle: "long",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function ResultadoCineticaView({ payload, onNueva }: Props) {
  const resultado = payload.t207cinetica || payload.resultado;
  const ajustes = payload.ajustes ?? { fontSizePx: 52, sweepPx: 800 };
  const fechaPractica = formatFecha(payload.startedAt);

  return (
    <div className="print-root mx-auto max-w-3xl px-4 py-8 text-slate-100 print:max-w-none print:px-0 print:py-0 print:text-black">
      <div className="no-print mb-6 flex flex-wrap gap-2 border-b border-slate-700 pb-4">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded border border-slate-500 bg-slate-800 px-4 py-2 text-sm text-slate-100 hover:bg-slate-700"
        >
          Imprimir / Guardar PDF
        </button>
        <button
          type="button"
          onClick={() => downloadJson(payload)}
          className="rounded border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
        >
          Exportar JSON
        </button>
        <button
          type="button"
          onClick={onNueva}
          className="rounded border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
        >
          Nueva prueba
        </button>
      </div>

      <article className="print-doc rounded border border-slate-600 bg-slate-900 p-6 print:border-black print:bg-white print:p-0">
        <header className="border-b border-slate-600 pb-5 print:border-black">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center justify-center rounded bg-white px-3 py-2">
              <Image
                src="/logo-proteger.png"
                alt="Proteger IPS"
                width={180}
                height={56}
                className="h-12 w-auto object-contain print:h-14"
                priority
              />
            </div>
            <div className="text-center sm:text-right">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400 print:text-neutral-600">
                Proteger IPS
              </p>
              <p className="mt-1 text-xs text-slate-500 print:text-neutral-600">
                Evaluación de visión
              </p>
            </div>
          </div>
          <h1 className="mt-5 text-center text-xl font-semibold tracking-tight text-slate-50 print:text-black">
            Informe de agudeza visual cinética
          </h1>
          <p className="mt-1 text-center text-sm text-slate-400 print:text-neutral-700">
            Test CINETICA — campo t207cinetica
          </p>
        </header>

        {/* Fecha de la práctica — siempre visible e imprimible */}
        <section className="mt-5 border border-slate-600 bg-slate-800/40 px-4 py-3 print:border-black print:bg-neutral-50">
          <p className="text-[11px] uppercase tracking-wide text-slate-500 print:text-neutral-600">
            Fecha de la práctica
          </p>
          <p className="mt-1 text-base font-semibold text-slate-100 print:text-black">
            {fechaPractica}
          </p>
          <p className="mt-1 text-xs text-slate-500 print:text-neutral-600">
            Finalización: {formatFecha(payload.finishedAt)}
          </p>
        </section>

        <section className="mt-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 print:text-neutral-500">
              Protocolo
            </p>
            <p className="mt-0.5 font-mono text-xs print:text-black">
              {payload.protocol}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 print:text-neutral-500">
              Presentación (ajustes de sesión)
            </p>
            <p className="mt-0.5 print:text-black">
              Letra {ajustes.fontSizePx} px · Barrido {ajustes.sweepPx} px
            </p>
          </div>
        </section>

        <section className="mt-6 border border-slate-600 print:border-black">
          <div className="grid grid-cols-3 divide-x divide-slate-600 border-b border-slate-600 text-center print:divide-black print:border-black">
            <div className="px-3 py-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-500 print:text-neutral-600">
                Resultado
              </p>
              <p className="mt-1 text-lg font-semibold tracking-wide print:text-black">
                {resultado}
              </p>
            </div>
            <div className="px-3 py-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-500 print:text-neutral-600">
                Aciertos
              </p>
              <p className="mt-1 text-lg font-semibold print:text-black">
                {payload.correctas} / {payload.total}
              </p>
            </div>
            <div className="px-3 py-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-500 print:text-neutral-600">
                Criterio
              </p>
              <p className="mt-1 text-sm font-medium print:text-black">
                &gt; 4 correctas → NORMAL
              </p>
            </div>
          </div>
          <p className="px-3 py-2 text-center text-xs text-slate-400 print:text-neutral-600">
            Referencia: agudeza visual cinética (&le; 20/60)
          </p>
        </section>

        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-slate-200 print:text-black">
            Detalle de ensayos
          </h2>
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-600 bg-slate-800/80 print:border-black print:bg-neutral-100">
                <th className="px-3 py-2 font-medium text-slate-300 print:text-black">
                  N.º
                </th>
                <th className="px-3 py-2 font-medium text-slate-300 print:text-black">
                  Estímulo
                </th>
                <th className="px-3 py-2 font-medium text-slate-300 print:text-black">
                  Velocidad (ms)
                </th>
                <th className="px-3 py-2 font-medium text-slate-300 print:text-black">
                  Valoración
                </th>
              </tr>
            </thead>
            <tbody>
              {payload.ensayos.map((e) => (
                <tr
                  key={e.index}
                  className="border-b border-slate-700 print:border-neutral-300"
                >
                  <td className="px-3 py-1.5 tabular-nums print:text-black">
                    {e.index + 1}
                  </td>
                  <td className="px-3 py-1.5 font-mono text-base font-semibold print:text-black">
                    {e.letra}
                  </td>
                  <td className="px-3 py-1.5 tabular-nums print:text-black">
                    {e.velocidadMs}
                  </td>
                  <td className="px-3 py-1.5 print:text-black">
                    {e.correcto ? "Correcta" : "Incorrecta"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-6 text-xs leading-relaxed text-slate-400 print:text-neutral-600">
          <p>
            <span className="font-medium text-slate-300 print:text-neutral-800">
              Observaciones técnicas:{" "}
            </span>
            {payload.notas}
          </p>
          {payload.aborted && (
            <p className="mt-2 font-medium text-slate-300 print:text-black">
              Esta sesión fue marcada como abortada / incompleta.
            </p>
          )}
        </section>

        <footer className="mt-8 border-t border-slate-600 pt-4 text-center text-xs text-slate-500 print:border-black print:text-neutral-600">
          <p>Proteger IPS · Test CINETICA</p>
          <p className="mt-1">Fecha de la práctica: {fechaPractica}</p>
        </footer>
      </article>
    </div>
  );
}
