"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ResultSummary } from "@/components/ResultSummary";
import { loadResult } from "@/lib/session";
import type { SessionResultPayload } from "@/lib/types";

export default function ResultPage() {
  const router = useRouter();
  const [payload, setPayload] = useState<SessionResultPayload | null>(null);

  useEffect(() => {
    const r = loadResult();
    if (!r) {
      router.replace("/setup");
      return;
    }
    setPayload(r);
  }, [router]);

  if (!payload) {
    return (
      <main className="flex flex-1 items-center justify-center text-slate-400">
        Cargando resultado…
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col px-4 py-10">
      <ResultSummary payload={payload} />
    </main>
  );
}
