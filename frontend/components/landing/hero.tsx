"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { HeroVisual } from "./hero-visual";

const WORDS = ["Different", "sun.", "Different", "scale.", "Same", "ground."];

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section id="top" className="relative">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div className="max-w-[48ch]">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[11px] tracking-[0.18em] text-signal ring-1 ring-signal/25"
          >
            <span className="reticle size-1.5 rounded-full bg-signal" />
            SMART INDIA HACKATHON · PS 26166
          </motion.div>

          <h1 className="mt-6 text-[2.4rem] font-semibold leading-[1.04] tracking-tight text-balance sm:text-[3.1rem] xl:text-[3.5rem]">
            {WORDS.map((word, i) => (
              <motion.span
                key={i}
                className={`inline-block ${i > 3 ? "text-signal" : ""}`}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.07, ease: [0.22, 0.61, 0.36, 1] }}
              >
                {word}
                {i < WORDS.length - 1 ? "\u00A0" : ""}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mt-5 max-w-[46ch] text-pretty text-base text-mist sm:text-lg"
          >
            LunaMatch finds which pixel in a Chandrayaan-2 image is which pixel in a
            lunar reference image — across a 300× resolution gap, opposite shadow
            directions and different viewing geometry — then warps the source frame
            into register and reports how good the fit actually is.
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <a
              href="#pipeline"
              className="group inline-flex items-center gap-2 rounded-md bg-signal px-5 py-3 font-mono text-sm font-semibold text-void ring-1 ring-signal/40 transition-colors hover:bg-bone"
            >
              Walk the pipeline
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#problem"
              className="inline-flex items-center gap-2 rounded-md px-5 py-3 font-mono text-sm font-medium text-bone ring-1 ring-line transition-colors hover:ring-mist"
            >
              Why it is hard
            </a>
          </motion.div>

          <motion.dl
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-9 grid max-w-md grid-cols-3 gap-4 border-t border-line/60 pt-5"
          >
            <div>
              <dt className="sr-only">Scale gap between the coarsest and finest sensors</dt>
              <dd className="tabular font-mono text-lg text-bone">~300×</dd>
              <dd className="font-mono text-[10px] tracking-[0.12em] text-ash">
                SCALE GAP IIRS↔OHRC
              </dd>
            </div>
            <div>
              <dt className="sr-only">Chandrayaan-2 optical payloads supported as source</dt>
              <dd className="tabular font-mono text-lg text-bone">3</dd>
              <dd className="font-mono text-[10px] tracking-[0.12em] text-ash">
                CH-2 SOURCE SENSORS
              </dd>
            </div>
            <div>
              <dt className="sr-only">Required deliverables</dt>
              <dd className="tabular font-mono text-lg text-bone">3</dd>
              <dd className="font-mono text-[10px] tracking-[0.12em] text-ash">
                REQUIRED OUTPUTS
              </dd>
            </div>
          </motion.dl>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}
