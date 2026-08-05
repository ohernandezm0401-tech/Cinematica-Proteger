"use client";

import { useState } from "react";
import {
  DEFAULT_CONFIG,
  DISTANCE_OPTIONS,
  type Eye,
  type SessionConfig,
  type Speed,
} from "@/lib/types";

interface SessionSetupFormProps {
  onStart: (config: SessionConfig, goCalibrate: boolean) => void;
}

export function SessionSetupForm({ onStart }: SessionSetupFormProps) {
  const [eye, setEye] = useState<Eye>(DEFAULT_CONFIG.eye);
  const [distanceMeters, setDistanceMeters] = useState(
    DEFAULT_CONFIG.distanceMeters,
  );
  const [speed, setSpeed] = useState<Speed>(DEFAULT_CONFIG.speed);
  const [trialsPerLevel, setTrialsPerLevel] = useState(
    DEFAULT_CONFIG.trialsPerLevel,
  );
  const [calibrate, setCalibrate] = useState(true);

  const build = (): SessionConfig => ({
    ...DEFAULT_CONFIG,
    eye,
    distanceMeters,
    speed,
    trialsPerLevel,
    calibrated: false,
    ppi: 96,
  });

  return (
    <form
      className="mx-auto flex max-w-lg flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        onStart(build(), calibrate);
      }}
    >
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">
          Agudeza Visual Cinemática
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Prueba Landolt C en movimiento · guiada por profesional · app
          independiente
        </p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-slate-300">Ojo</legend>
        <div className="flex gap-2">
          {(["OD", "OI", "AO"] as Eye[]).map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setEye(o)}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm ${
                eye === o
                  ? "border-sky-500 bg-sky-600/30 text-sky-100"
                  : "border-slate-600 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-2 text-sm text-slate-300">
        Distancia de sala (m)
        <select
          value={distanceMeters}
          onChange={(e) => setDistanceMeters(Number(e.target.value))}
          className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
        >
          {DISTANCE_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {d} m
            </option>
          ))}
        </select>
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-slate-300">
          Velocidad del estímulo
        </legend>
        <div className="flex gap-2">
          {(
            [
              ["slow", "Lenta"],
              ["medium", "Media"],
              ["fast", "Rápida"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setSpeed(value)}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm ${
                speed === value
                  ? "border-sky-500 bg-sky-600/30 text-sky-100"
                  : "border-slate-600 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-2 text-sm text-slate-300">
        Ensayos por nivel
        <input
          type="number"
          min={3}
          max={10}
          value={trialsPerLevel}
          onChange={(e) => setTrialsPerLevel(Number(e.target.value) || 5)}
          className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
        />
      </label>

      <label className="flex items-center gap-3 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={calibrate}
          onChange={(e) => setCalibrate(e.target.checked)}
          className="size-4 rounded border-slate-600"
        />
        Calibrar pantalla con tarjeta (recomendado)
      </label>

      <button
        type="submit"
        className="mt-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-500"
      >
        Continuar
      </button>
    </form>
  );
}
