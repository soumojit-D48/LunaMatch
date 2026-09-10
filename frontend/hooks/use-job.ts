"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getJob, getResult, type Job, type JobResult } from "@/lib/api-client";

/** Polls GET /jobs/{id} every 2s until the job reaches a terminal state. */
export function useJob(id: string) {
  const [job, setJob] = useState<Job | null>(null);
  const [result, setResult] = useState<JobResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const { job: next } = await getJob(id);
        if (cancelled) return;
        setJob(next);
        if (next.status === "SUCCEEDED") {
          stop();
          const full = await getResult(id);
          if (!cancelled) setResult(full);
        } else if (next.status === "FAILED") {
          stop();
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "request failed");
          stop();
        }
      }
    };
    tick();
    timer.current = setInterval(tick, 2000);
    return () => {
      cancelled = true;
      stop();
    };
  }, [id, stop]);

  return { job, result, error };
}
