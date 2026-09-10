"use client";

import type { JobStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const STYLES: Record<JobStatus, string> = {
  PENDING: "text-flare ring-flare/30 bg-flare/10",
  RUNNING: "text-signal ring-signal/30 bg-signal/10",
  SUCCEEDED: "text-signal ring-signal/30 bg-signal/10",
  FAILED: "text-destructive ring-destructive/30 bg-destructive/10",
};

export function JobStatusBadge({ status, className }: { status: JobStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] ring-1",
        STYLES[status],
        className,
      )}
    >
      <span className="reticle size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
