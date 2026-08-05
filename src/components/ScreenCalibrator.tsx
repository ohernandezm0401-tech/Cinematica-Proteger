"use client";

import { useMemo, useState } from "react";
import { ppiFromCardWidthPx } from "@/lib/geometry";
import { CREDIT_CARD_WIDTH_MM } from "@/lib/types";

interface ScreenCalibratorProps {
  initialPpi?: number;
  onSave: (ppi: number) => void;
  onSkip: () => void;
}

export function ScreenCalibrator({
  initialPpi = 96,
  onSave,
  onSkip,
}: ScreenCalibratorProps) {
  // Width in CSS px of the on-screen card rectangle
  const [widthPx, setWidthPx] = useState(() =>
    Math.round((CREDIT_CARD_WIDTH_MM * initialPpi) / 25.4),
  );

  const ppi = useMemo(
    () => Math.round(ppiFromCardWidthPx(widthPx) * 10) / 10,
    [widthPx],
  );

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">
          Calibrar pantalla
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Coloque una tarjeta de crédito física sobre el rectángulo y ajuste el
          ancho hasta que coincida (85,6 mm). Así calculamos el PPI real del
          monitor.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-700 bg-slate-900/80 p-6">
        <div
          className="rounded border-2 border-dashed border-violet-400 bg-violet-500/10"
          style={{
            width: widthPx,
            height: Math.round(widthPx * (53.98 / 85.6)),
            maxWidth: "100%",
          }}
          aria-hidden
        />
        <label className="flex w-full flex-col gap-2 text-sm text-slate-300">
          Ancho del rectángulo
          <input
            type="range"
            min={120}
            max={480}
            value={widthPx}
            onChange={(e) => setWidthPx(Number(e.target.value))}
            className="w-full"
          />
          <span className="text-slate-400">
            {widthPx} px → <strong className="text-slate-100">{ppi} PPI</strong>
          </span>
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onSave(ppi)}
          className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-500"
        >
          Guardar calibración
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-xl border border-slate-600 px-5 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
        >
          Omitir (usar 96 DPI)
        </button>
      </div>
    </div>
  );
}
