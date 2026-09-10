import type { EvaluationReport, MatchPoint } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function Card({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="panel-glass rounded-xl p-4 ring-1 ring-white/10">
      <div className="font-mono text-[10px] tracking-[0.16em] text-ash">{label}</div>
      <div className={cn("tabular mt-1 font-mono text-2xl", accent ? "text-signal" : "text-bone")}>{value}</div>
      {sub ? <div className="mt-1 font-mono text-[10px] text-mist">{sub}</div> : null}
    </div>
  );
}

export function MetricCards({ report }: { report: EvaluationReport }) {
  return (
    <div>
      {report.reliability !== "high" && (
        <div
          className={cn(
            "mb-3 rounded-xl p-4 font-mono text-xs leading-relaxed ring-1",
            report.reliability === "low"
              ? "bg-flare/10 text-flare ring-flare/30"
              : "bg-destructive/10 text-destructive ring-destructive/30",
          )}
        >
          {report.reliability === "low" ? "LOW CONFIDENCE — " : "REGISTRATION FAILED — "}
          {report.reliabilityReason}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Card label="RMSE X" value={`${report.rmseX.toFixed(2)} px`} accent={report.rmseX < 1} />
        <Card label="RMSE Y" value={`${report.rmseY.toFixed(2)} px`} accent={report.rmseY < 1} />
        <Card label="INLIERS" value={String(report.inlierCount)} sub={`${Math.round(report.inlierRatio * 100)}% inlier ratio`} />
        <Card label="COVERAGE" value={`${Math.round(report.coverageScore * 100)}%`} sub="6×6 grid occupancy" />
        <Card label="WALL TIME" value={`${report.processingTimeS.toFixed(1)} s`} />
        <Card label="RELIABILITY" value={report.reliability.toUpperCase()} accent={report.reliability === "high"} />
      </div>
    </div>
  );
}

export function CoverageGrid({ matches }: { matches: MatchPoint[] }) {
  const cells: number[][] = Array.from({ length: 6 }, () => Array(6).fill(0));
  for (const m of matches) {
    if (!m.isInlier) continue;
    cells[Math.min(5, Math.floor(m.refY * 6))][Math.min(5, Math.floor(m.refX * 6))] += 1;
  }
  const max = Math.max(1, ...cells.flat());
  return (
    <div className="panel-glass rounded-xl p-4 ring-1 ring-white/10">
      <div className="mb-2 font-mono text-[10px] tracking-[0.16em] text-ash">SPATIAL COVERAGE · 6×6</div>
      <div className="grid grid-cols-6 gap-1">
        {cells.flatMap((row, y) =>
          row.map((v, x) => (
            <div
              key={`${x}:${y}`}
              title={`${v} inliers`}
              className="aspect-square rounded-sm"
              style={{ background: `color-mix(in oklab, var(--signal) ${(v / max) * 100}%, var(--panel))` }}
            />
          )),
        )}
      </div>
    </div>
  );
}
