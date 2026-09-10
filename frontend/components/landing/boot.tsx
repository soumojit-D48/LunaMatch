"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useBootStore } from "@/store/boot-store";

const PHASES = [
  "ACQUIRING SOURCE FRAME",
  "LOADING EPHEMERIS",
  "CALIBRATING OPTICS",
  "RESOLVING MATCH POINTS",
  "SIGNAL LOCK",
];

const KEY = "lunamatch-booted";
const DURATION_MS = 2200;

/** Full-screen instrument boot overlay. Plays once per session, then hands off to the hero. */
export function Boot() {
  const setBooted = useBootStore((s) => s.setBooted);
  const reduced = useReducedMotion();
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let alive = true;
    try {
      if (reduced || sessionStorage.getItem(KEY)) {
        setBooted();
        return;
      }
    } catch {
      setBooted();
      return;
    }
    setShow(true);
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      if (!alive) return;
      const p = Math.min(1, (t - start) / DURATION_MS);
      // Ease the bar so it feels like real acquisition, not a timer.
      const eased = 1 - Math.pow(1 - p, 2);
      setProgress(Math.round(eased * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        try {
          sessionStorage.setItem(KEY, "1");
        } catch {
          /* private mode — replay next visit, harmless */
        }
        setBooted();
        setTimeout(() => {
          if (alive) setShow(false);
        }, 500);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [reduced, setBooted]);

  const phase = PHASES[Math.min(PHASES.length - 1, Math.floor((progress / 100) * PHASES.length))];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden
          className="fixed inset-0 z-[100] flex items-center justify-center bg-void"
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeOut" } }}
        >
          <div aria-hidden className="scanline pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative w-full max-w-xs px-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="mx-auto grid size-12 place-items-center rounded-lg bg-signal/15 ring-1 ring-signal/30"
            >
              <span className="reticle size-3 rounded-full bg-signal" />
            </motion.div>
            <div className="mt-5 text-lg font-semibold tracking-tight text-bone">LunaMatch</div>
            <div className="mt-1 font-mono text-[10px] tracking-[0.24em] text-ash">
              LUNAR REGISTRATION CONSOLE
            </div>

            <div className="mt-8 h-px w-full bg-line/60">
              <div className="h-px bg-signal transition-[width] duration-100" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-3 flex items-center justify-between font-mono text-[10px] tracking-[0.16em]">
              <span className="text-signal">{phase}</span>
              <span className="tabular text-ash">{progress}%</span>
            </div>
          </div>
          <div className="absolute bottom-6 left-0 right-0 text-center font-mono text-[9px] tracking-[0.2em] text-ash/70">
            CH-2 DOWNLINK · SIMULATED ACQUISITION
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
