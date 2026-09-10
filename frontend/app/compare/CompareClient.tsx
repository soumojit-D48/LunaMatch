"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getResult, type JobResult } from "@/lib/api-client";
import { MATCHER_LABELS } from "@/lib/mock-data";
import { MatchViewer } from "@/components/viewer/MatchViewer";
import { ConsoleNav } from "@/components/ConsoleNav";
import sourceImg from "@/assets/lunar-source.jpg";
import referenceImg from "@/assets/lunar-reference.jpg";

const A_ID = "job-7f3a-ohrc-nac";
const B_ID = "job-9c1e-tmc2-nac";

function Delta({ label, a, b, lowerBetter = true }: { label: string; a: number; b: number; lowerBetter?: boolean }) {
  const aWins = lowerBetter ? a <= b : a >= b;
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-line/40 px-4 py-3 font-mono text-xs last:border-0">
      <span className="tracking-[0.12em] text-ash">{label}</span>
      <span className={`tabular ${aWins ? "text-signal" : "text-bone"}`}>{a}</span>
      <span className={`tabular ${!aWins ? "text-signal" : "text-bone"}`}>{b}</span>
    </div>
  );
}

export default function ComparePage() {
  const [a, setA] = useState<JobResult | null>(null);
  const [b, setB] = useState<JobResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getResult(A_ID), getResult(B_ID)]).then(([ra, rb]) => {
      if (!cancelled) {
        setA(ra);
        setB(rb);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-void text-bone">
      <ConsoleNav />
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <Link href="/jobs" className="inline-flex items-center gap-2 font-mono text-xs text-mist transition-colors hover:text-bone">
          <ArrowLeft className="size-3.5" /> ALL JOBS
        </Link>
        <p className="mt-4 font-mono text-[11px] tracking-[0.2em] text-signal">CONSOLE — COMPARE</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Learned vs classical</h1>
        <p className="mt-2 max-w-[64ch] text-sm text-mist">
          The same source tile registered twice — once with a learned matcher, once with a
          classical baseline. Winner per row is highlighted.
        </p>

        {!a || !b ? (
          <p className="mt-8 font-mono text-sm text-mist">Loading both runs…</p>
        ) : (
          <div className="mt-8 space-y-8">
            <div className="overflow-hidden rounded-xl ring-1 ring-white/10">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 bg-surface/60 px-4 py-3 font-mono text-[10px] tracking-[0.16em] text-ash">
                <span>METRIC</span>
                <span className="text-right">{MATCHER_LABELS[a.job.matcherType].toUpperCase()}</span>
                <span className="text-right">{MATCHER_LABELS[b.job.matcherType].toUpperCase()}</span>
              </div>
              <Delta label="RMSE X (PX)" a={a.report.rmseX} b={b.report.rmseX} />
              <Delta label="RMSE Y (PX)" a={a.report.rmseY} b={b.report.rmseY} />
              <Delta label="INLIERS" a={a.report.inlierCount} b={b.report.inlierCount} lowerBetter={false} />
              <Delta label="INLIER RATIO" a={a.report.inlierRatio} b={b.report.inlierRatio} lowerBetter={false} />
              <Delta label="COVERAGE" a={a.report.coverageScore} b={b.report.coverageScore} lowerBetter={false} />
              <Delta label="WALL TIME (S)" a={a.report.processingTimeS} b={b.report.processingTimeS} />
            </div>

            {[
              { r: a, tag: "RUN A" },
              { r: b, tag: "RUN B" },
            ].map(({ r, tag }) => (
              <section key={tag}>
                <h2 className="mb-3 font-mono text-[11px] tracking-[0.2em] text-signal">
                  {tag} — {MATCHER_LABELS[r.job.matcherType].toUpperCase()}
                </h2>
                <MatchViewer matches={r.matches} sourceImg={sourceImg} referenceImg={referenceImg} />
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
