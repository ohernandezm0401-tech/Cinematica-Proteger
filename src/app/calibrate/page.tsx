"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScreenCalibrator } from "@/components/ScreenCalibrator";
import { loadSession, saveSession } from "@/lib/session";
import type { ActiveSession } from "@/lib/types";

export default function CalibratePage() {
  const router = useRouter();
  const [session, setSession] = useState<ActiveSession | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) {
      router.replace("/setup");
      return;
    }
    setSession(s);
  }, [router]);

  if (!session) {
    return (
      <main className="flex flex-1 items-center justify-center text-slate-400">
        Cargando…
      </main>
    );
  }

  const applyPpi = (ppi: number, calibrated: boolean) => {
    const next: ActiveSession = {
      ...session,
      config: { ...session.config, ppi, calibrated },
    };
    saveSession(next);
    router.push("/test");
  };

  return (
    <main className="flex flex-1 flex-col px-4 py-10">
      <ScreenCalibrator
        initialPpi={session.config.ppi}
        onSave={(ppi) => applyPpi(ppi, true)}
        onSkip={() => applyPpi(96, false)}
      />
    </main>
  );
}
