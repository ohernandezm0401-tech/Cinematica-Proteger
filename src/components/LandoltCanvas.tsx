"use client";

import { useEffect, useRef } from "react";
import { diameterPxForLogMAR, strokePxForLogMAR } from "@/lib/geometry";
import { gapRotationDeg, sweepDurationMs } from "@/lib/motion";
import type { Direction, MotionDirection, Speed } from "@/lib/types";

interface LandoltCanvasProps {
  logMAR: number;
  distanceMeters: number;
  ppi: number;
  gapDirection: Direction;
  motion: MotionDirection;
  speed: Speed;
  running: boolean;
  /** Bump to restart animation for a new trial */
  trialKey: number;
}

export function LandoltCanvas({
  logMAR,
  distanceMeters,
  ppi,
  gapDirection,
  motion,
  speed,
  running,
  trialKey,
}: LandoltCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    const resize = () => {
      const w = parent?.clientWidth ?? 800;
      const h = parent?.clientHeight ?? 360;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const duration = sweepDurationMs(speed);
    const start = performance.now();
    let cancelled = false;

    const drawC = (
      cx: number,
      cy: number,
      outerD: number,
      stroke: number,
      gap: Direction,
    ) => {
      const r = outerD / 2;
      const innerR = Math.max(r - stroke, 1);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((gapRotationDeg(gap) * Math.PI) / 180);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.arc(0, 0, innerR, 0, Math.PI * 2, true);
      ctx.fillStyle = "#f8fafc";
      ctx.fill("evenodd");
      // Gap cutout on the right
      ctx.fillStyle = "#020617";
      ctx.fillRect(innerR - 1, -stroke / 2, stroke + r - innerR + 4, stroke);
      ctx.restore();
    };

    const frame = (now: number) => {
      if (cancelled) return;
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, cssW, cssH);

      const outerD = Math.max(
        diameterPxForLogMAR(logMAR, distanceMeters, ppi),
        8,
      );
      const stroke = Math.max(
        strokePxForLogMAR(logMAR, distanceMeters, ppi),
        1.5,
      );

      const margin = outerD / 2 + 16;
      const y = cssH / 2;
      let t = running ? (now - start) / duration : 0;
      t = Math.min(Math.max(t, 0), 1);
      // Hold at end if finished
      const x =
        motion === "L2R"
          ? margin + t * (cssW - 2 * margin)
          : cssW - margin - t * (cssW - 2 * margin);

      drawC(x, y, outerD, stroke, gapDirection);

      // floor line
      ctx.strokeStyle = "#1e293b";
      ctx.beginPath();
      ctx.moveTo(0, cssH - 12);
      ctx.lineTo(cssW, cssH - 12);
      ctx.stroke();

      if (running && t < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else if (!running) {
        // static center when paused
        ctx.fillStyle = "#020617";
        ctx.fillRect(0, 0, cssW, cssH);
        drawC(cssW / 2, y, outerD, stroke, gapDirection);
      }
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [
    logMAR,
    distanceMeters,
    ppi,
    gapDirection,
    motion,
    speed,
    running,
    trialKey,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full touch-none"
      aria-label="Estímulo Landolt C en movimiento"
    />
  );
}
