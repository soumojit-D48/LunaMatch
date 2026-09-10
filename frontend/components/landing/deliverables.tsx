import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const CAPABILITIES = [
  {
    code: "C·01",
    title: "Generic across the Chandrayaan-2 optical set",
    body:
      "Sensor-specific preprocessing plugs into one shared matching core, so OHRC, TMC-2 and IIRS each become a valid source against LRO NAC or SELENE — not a script tuned to a single pair.",
  },
  {
    code: "C·02",
    title: "Illumination-tolerant correspondence",
    body:
      "Photometric levelling plus structure-led descriptors keep matches alive when the two acquisitions throw shadows in opposite directions.",
  },
  {
    code: "C·03",
    title: "Sub-pixel localisation",
    body:
      "Correlation-peak fitting and least-squares refinement push each match below the pixel grid, because one OHRC pixel is already ~25 cm of Moon.",
  },
  {
    code: "C·04",
    title: "Uniform control-point coverage",
    body:
      "Grid binning after outlier rejection stops the transform being fitted from a single well-textured corner of the overlap.",
  },
  {
    code: "C·05",
    title: "Self-reported quality",
    body:
      "Every run answers 'how good was this?' in numbers — RMSE, inlier count and ratio, coverage — instead of leaving it to a visual eyeball check.",
  },
  {
    code: "C·06",
    title: "Swappable matching backends",
    body:
      "Classical and learned matchers behind one interface, so a GPU-free environment still runs the full pipeline and the two can be compared head to head.",
  },
];

export function Deliverables() {
  return (
    <section id="deliverables" className="scroll-mt-24 border-t border-line/60 bg-surface/50">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <SectionHeading
          index="07"
          eyebrow="CAPABILITIES"
          title="What the system is built to do."
          note="Each capability maps to a requirement written into the problem statement."
        />

        <div className="grid gap-px overflow-hidden rounded-xl bg-line/60 ring-1 ring-line/60 md:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((cap, i) => (
            <Reveal key={cap.code} delay={(i % 3) * 0.06}>
              <article className="group h-full bg-void p-6 transition-colors hover:bg-surface">
                <div className="font-mono text-[10px] tracking-[0.16em] text-ash transition-colors group-hover:text-signal">
                  {cap.code}
                </div>
                <h3 className="mt-3 text-base font-semibold leading-snug text-bone">{cap.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist">{cap.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
