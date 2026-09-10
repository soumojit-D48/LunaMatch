"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

type Node = {
  id: string;
  name: string;
  role: string;
  input: string;
  output: string;
};

const NODES: Node[] = [
  {
    id: "N·01",
    name: "Input layer",
    role: "Reads source, reference and their labels",
    input: "PDS / GeoTIFF products",
    output: "Frames + metadata → Preprocessing",
  },
  {
    id: "N·02",
    name: "Preprocessing engine",
    role: "Projection check, resampling, intensity and illumination normalisation",
    input: "Frames + metadata",
    output: "Levelled tiles → Matching",
  },
  {
    id: "N·03",
    name: "Matching engine",
    role: "Pluggable classical or learned feature extraction and correspondence search",
    input: "Levelled tiles, region of interest",
    output: "Candidate pairs → Registration",
  },
  {
    id: "N·04",
    name: "Registration engine",
    role: "Outlier rejection, uniform selection, sub-pixel refinement, transform fit and warp",
    input: "Candidate pairs",
    output: "Registered product + control points",
  },
  {
    id: "N·05",
    name: "Evaluation engine",
    role: "Computes RMSE, inlier statistics, coverage and comparison visualisations",
    input: "Registered product + pairs",
    output: "Metrics + overlays → Packaging",
  },
  {
    id: "N·06",
    name: "API & interface",
    role: "Orchestrates a run and serves results to a UI or a batch CLI",
    input: "Packaged outputs",
    output: "Downloadable artefacts",
  },
];

export function Architecture() {
  const [activeId, setActiveId] = useState<string>("N·02");
  const reduced = useReducedMotion();
  const active = NODES.find((n) => n.id === activeId) ?? (NODES[0] as Node);

  return (
    <section id="architecture" className="scroll-mt-24 border-t border-line/60">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <SectionHeading
          index="06"
          eyebrow="ARCHITECTURE"
          title="A pipeline of services, not a single script."
          note="Hover or tap a node to read its contract."
        />

        <Reveal>
          <div className="panel-glass rounded-xl p-5 ring-1 ring-white/10 sm:p-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {NODES.map((node) => {
                const isActive = node.id === activeId;
                return (
                  <button
                    key={node.id}
                    type="button"
                    onMouseEnter={() => setActiveId(node.id)}
                    onFocus={() => setActiveId(node.id)}
                    onClick={() => setActiveId(node.id)}
                    aria-pressed={isActive}
                    className={`rounded-lg bg-void/50 p-3 text-left transition-colors ${
                      isActive ? "ring-1 ring-signal/60" : "ring-1 ring-line hover:ring-mist/50"
                    }`}
                  >
                    <div
                      className={`font-mono text-[9px] tracking-[0.14em] ${
                        isActive ? "text-signal" : "text-ash"
                      }`}
                    >
                      {node.id}
                    </div>
                    <div
                      className={`mt-1 text-sm font-semibold leading-snug ${
                        isActive ? "text-signal" : "text-bone"
                      }`}
                    >
                      {node.name}
                    </div>
                  </button>
                );
              })}
            </div>

            <motion.dl
              key={active.id}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-6 grid gap-3 border-t border-line/60 pt-5 font-mono text-[11px] sm:grid-cols-2"
            >
              <div>
                <dt className="text-ash">NODE</dt>
                <dd className="text-bone">{active.name}</dd>
              </div>
              <div>
                <dt className="text-ash">ROLE</dt>
                <dd className="text-bone">{active.role}</dd>
              </div>
              <div>
                <dt className="text-ash">INPUT</dt>
                <dd className="text-bone">{active.input}</dd>
              </div>
              <div>
                <dt className="text-ash">OUTPUT</dt>
                <dd className="text-signal">{active.output}</dd>
              </div>
            </motion.dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
