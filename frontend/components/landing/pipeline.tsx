"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

type Stage = {
  id: string;
  name: string;
  short: string;
  detail: string;
  input: string;
  output: string;
};

const STAGES: Stage[] = [
  {
    id: "01",
    name: "Ingest",
    short: "Read imagery + labels",
    detail:
      "Source and reference products are read together with their labels — sensor and mode, acquisition time, sun azimuth and elevation, nominal GSD, projection and footprint. Nothing downstream is trustworthy without knowing what is being looked at.",
    input: "PDS / GeoTIFF products",
    output: "Frames + parsed metadata",
  },
  {
    id: "02",
    name: "Preprocess",
    short: "Common frame, common depth",
    detail:
      "Reproject to a shared frame where georeferencing exists, normalise to a common bit depth for the matching stage, and keep the full-precision product separate for science use.",
    input: "Frames + metadata",
    output: "Normalised tiles",
  },
  {
    id: "03",
    name: "Illumination",
    short: "Take the sun out of it",
    detail:
      "CLAHE, histogram matching, log transforms and shadow normalisation chosen per sensor pair, so that opposite shadow directions stop dominating the descriptors.",
    input: "Normalised tiles",
    output: "Photometrically levelled tiles",
  },
  {
    id: "04",
    name: "Overlap",
    short: "Search where it matters",
    detail:
      "Footprint metadata — or a coarse, heavily downsampled whole-image match as fallback — restricts the reference to the likely overlap before fine matching. Saves compute and kills false matches from unrelated terrain.",
    input: "Footprints",
    output: "Region of interest",
  },
  {
    id: "05",
    name: "Features",
    short: "Detect and describe",
    detail:
      "Classical detectors (SIFT, ASIFT, AKAZE, RIFT2) or learned ones (SuperPoint) run over both frames. For a hyperspectral IIRS cube, one representative band is selected first and the resulting transform is propagated to the rest.",
    input: "Levelled tiles",
    output: "Keypoints + descriptors",
  },
  {
    id: "06",
    name: "Match",
    short: "Propose correspondences",
    detail:
      "Nearest neighbour with a ratio test on the classical path, or graph-neural joint matching with SuperGlue / LightGlue on the learned path. A cheap geometric plausibility filter trims very large candidate sets.",
    input: "Descriptors",
    output: "Candidate point pairs",
  },
  {
    id: "07",
    name: "RANSAC",
    short: "Throw out the liars",
    detail:
      "A transform model — similarity, affine or homography — is fitted robustly; MAGSAC++ style variants remove the manual inlier-threshold guesswork. Outliers are labelled, not silently dropped.",
    input: "Candidate pairs",
    output: "Inliers + model",
  },
  {
    id: "08",
    name: "Distribute",
    short: "Grid-select the inliers",
    detail:
      "Inliers are binned across the overlap region and capped per cell so the retained control points cover the frame evenly — the PS asks for uniform distribution, and a well-spread set fits a far more stable transform.",
    input: "Inlier set",
    output: "Uniform control points",
  },
  {
    id: "09",
    name: "Sub-pixel",
    short: "Below the pixel grid",
    detail:
      "Each retained match is refined by fitting a parabola or 2-D Gaussian to the correlation surface around the peak, or by small-window least-squares matching. At 0.25 m/pixel, one pixel of slop is 25 cm of ground error.",
    input: "Control points",
    output: "Refined sub-pixel pairs",
  },
  {
    id: "10",
    name: "Warp",
    short: "Resample into register",
    detail:
      "The transform is refitted on the refined set, then the source is resampled into the reference frame. Bilinear is the robust default; bicubic can underperform under strong shadow contrast.",
    input: "Refined pairs",
    output: "Registered product",
  },
  {
    id: "11",
    name: "Evaluate",
    short: "Report the numbers",
    detail:
      "RMSE on held-out check points, inlier count and ratio, a spatial coverage diagnostic and processing time — plus match-line overlays and checkerboard blends for visual inspection.",
    input: "Registered product + pairs",
    output: "Metrics + visualisations",
  },
];

export function Pipeline() {
  const [activeId, setActiveId] = useState<string>("06");
  const reduced = useReducedMotion();
  const active = STAGES.find((s) => s.id === activeId) ?? (STAGES[0] as Stage);

  return (
    <section id="pipeline" className="scroll-mt-24 border-t border-line/60 bg-surface/50">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <SectionHeading
          index="04"
          eyebrow="HOW IT WORKS"
          title="Eleven stages, from raw product to a scored registration."
          note="Select a stage to see what enters it and what leaves it."
        />

        <div
          role="tablist"
          aria-label="Registration pipeline stages"
          className="-mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-3 sm:mx-0 sm:px-0"
        >
          {STAGES.map((stage) => {
            const isActive = stage.id === activeId;
            return (
              <button
                key={stage.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActiveId(stage.id)}
                className={`w-36 shrink-0 snap-start rounded-lg p-3 text-left transition-colors ${
                  isActive
                    ? "bg-signal/10 ring-1 ring-signal/50"
                    : "panel-glass ring-1 ring-white/10 hover:ring-mist/40"
                }`}
              >
                <div
                  className={`font-mono text-[10px] tracking-[0.14em] ${
                    isActive ? "text-signal" : "text-ash"
                  }`}
                >
                  STAGE {stage.id}
                </div>
                <div
                  className={`mt-1 text-sm font-semibold ${isActive ? "text-signal" : "text-bone"}`}
                >
                  {stage.name}
                </div>
                <p className="mt-1.5 text-xs leading-snug text-mist">{stage.short}</p>
              </button>
            );
          })}
        </div>

        <Reveal className="mt-4">
          <div className="panel-glass rounded-xl p-6 ring-1 ring-white/10 sm:p-8">
            <motion.div
              key={active.id}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:gap-10"
            >
              <div>
                <div className="font-mono text-[10px] tracking-[0.18em] text-signal">
                  STAGE {active.id} · {active.name.toUpperCase()}
                </div>
                <p className="mt-3 max-w-[62ch] text-pretty text-base leading-relaxed text-mist">
                  {active.detail}
                </p>
              </div>
              <dl className="grid content-start gap-3 border-t border-line/60 pt-5 font-mono text-xs lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                <div className="flex justify-between gap-4">
                  <dt className="text-ash">IN</dt>
                  <dd className="text-right text-bone">{active.input}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ash">OUT</dt>
                  <dd className="text-right text-bone">{active.output}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ash">POSITION</dt>
                  <dd className="tabular text-right text-signal">{active.id} / 11</dd>
                </div>
              </dl>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
