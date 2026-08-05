"use client";

import type { Direction } from "@/lib/types";

const BUTTONS: { dir: Direction; label: string; grid: string }[] = [
  { dir: "up", label: "↑", grid: "col-start-2 row-start-1" },
  { dir: "left", label: "←", grid: "col-start-1 row-start-2" },
  { dir: "down", label: "↓", grid: "col-start-2 row-start-2" },
  { dir: "right", label: "→", grid: "col-start-3 row-start-2" },
];

interface ResponsePadProps {
  disabled?: boolean;
  onRespond: (direction: Direction) => void;
}

export function ResponsePad({ disabled, onRespond }: ResponsePadProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-center text-sm text-slate-400">
        Profesional: marque la dirección que indica el paciente
      </p>
      <div className="grid grid-cols-3 grid-rows-2 gap-2 w-48">
        {BUTTONS.map(({ dir, label, grid }) => (
          <button
            key={dir}
            type="button"
            disabled={disabled}
            aria-label={dir}
            onClick={() => onRespond(dir)}
            className={`${grid} h-14 rounded-xl bg-blue-700 text-2xl text-white shadow-lg transition hover:bg-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
