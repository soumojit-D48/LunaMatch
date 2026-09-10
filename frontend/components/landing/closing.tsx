import { ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";

export function Closing() {
  return (
    <section className="relative overflow-hidden border-t border-line/60">
      <div
        aria-hidden
        className="panel-glass pointer-events-none absolute inset-0 opacity-40"
        style={{ transform: "skewY(-2deg)" }}
      />
      <div className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:px-8 sm:py-28">
        <Reveal>
          <div className="font-mono text-[11px] tracking-[0.2em] text-signal">10 — FINAL</div>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Put every Chandrayaan-2 frame on the same grid.
          </h2>
          <p className="mx-auto mt-4 max-w-[46ch] text-pretty text-base text-mist">
            One source frame, one reference frame, and a registration you can defend
            with numbers rather than a visual guess.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#pipeline"
              className="group inline-flex items-center gap-2 rounded-md bg-signal px-6 py-3 font-mono text-sm font-semibold text-void ring-1 ring-signal/40 transition-colors hover:bg-bone"
            >
              Walk the pipeline
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#architecture"
              className="inline-flex items-center gap-2 rounded-md px-6 py-3 font-mono text-sm font-medium text-bone ring-1 ring-line transition-colors hover:ring-mist"
            >
              See the architecture
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line/60">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-6 font-mono text-[10px] tracking-[0.12em] text-ash sm:px-8">
        <span>LunaMatch · MULTI-MODAL LUNAR IMAGE CORRESPONDENCE</span>
        <span>ISRO · DEPARTMENT OF SPACE</span>
      </div>
    </footer>
  );
}
