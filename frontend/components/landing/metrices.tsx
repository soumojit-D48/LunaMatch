import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const METRICS = [
  {
    key: "RMSE",
    unit: "pixels / metres",
    what: "Root-mean-square residual on check points held out of the transform fit.",
    reads: "Lower is better. Sub-pixel is the target at OHRC scale.",
  },
  {
    key: "INLIER COUNT",
    unit: "matches",
    what: "Number of correspondences surviving robust model fitting.",
    reads: "Too few and the transform is not supported by evidence.",
  },
  {
    key: "INLIER RATIO",
    unit: "inliers / candidates",
    what: "Share of proposed matches the geometric model accepts.",
    reads: "A low ratio flags an illumination or scale mismatch upstream.",
  },
  {
    key: "COVERAGE",
    unit: "occupied grid cells",
    what: "How evenly the retained control points fall across the overlap.",
    reads: "Clustered points fit an unstable, locally biased transform.",
  },
  {
    key: "RUNTIME",
    unit: "seconds per pair",
    what: "Wall-clock time from ingest to registered product.",
    reads: "Bounds how large a batch is realistic to process.",
  },
];

export function Metrics() {
  return (
    <section id="metrics" className="scroll-mt-24 border-t border-line/60 bg-surface/50">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <SectionHeading
          index="06"
          eyebrow="HOW IT IS SCORED"
          title="Every registration leaves behind a report, not just a picture."
          note="These are the quantities reported per image pair. No measured values are shown here."
        />

        <div className="grid gap-px overflow-hidden rounded-xl bg-line/60 ring-1 ring-line/60 sm:grid-cols-2 lg:grid-cols-3">
          {METRICS.map((m, i) => (
            <Reveal key={m.key} delay={i * 0.05}>
              <div className="group relative h-full bg-void p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-mono text-xs tracking-[0.16em] text-signal">{m.key}</h3>
                  <span className="font-mono text-[10px] tracking-[0.12em] text-ash">
                    {m.unit}
                  </span>
                </div>
                <div className="relative mt-4 h-10 overflow-hidden rounded-md ring-1 ring-line/60">
                  <div className="fiducial-grid absolute inset-0 opacity-50" />
                  <div className="sweep-bar absolute inset-y-0 w-1/4" />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-bone">{m.what}</p>
                <p className="mt-2 text-xs leading-relaxed text-mist">{m.reads}</p>
              </div>
            </Reveal>
          ))}

          <Reveal delay={0.3}>
            <div className="h-full bg-void p-6">
              <h3 className="font-mono text-xs tracking-[0.16em] text-regolith">
                VISUAL DIAGNOSTICS
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-mist">
                <li>Match-line overlays between source and reference frames</li>
                <li>Checkerboard blends of the registered pair</li>
                <li>Residual vectors at each retained control point</li>
                <li>Control-point density map across the overlap</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
