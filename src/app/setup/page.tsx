"use client";

import { useRouter } from "next/navigation";
import { SessionSetupForm } from "@/components/SessionSetupForm";
import { createSession, saveSession } from "@/lib/session";
import type { SessionConfig } from "@/lib/types";

export default function SetupPage() {
  const router = useRouter();

  const onStart = (config: SessionConfig, goCalibrate: boolean) => {
    const session = createSession(config);
    saveSession(session);
    if (goCalibrate) {
      router.push("/calibrate");
    } else {
      router.push("/test");
    }
  };

  return (
    <main className="flex flex-1 flex-col px-4 py-10">
      <SessionSetupForm onStart={onStart} />
    </main>
  );
}
