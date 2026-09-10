import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const IDEAS = [
  {
    code: "I·01",
    title: "Match structure, not brightness",
    body:
      "Illumination-robust preprocessing — CLAHE, histogram matching, shadow normalisation — plus structure-based descriptors, so a rim is recognised by its shape rather than which side of it is lit.",
  },
  {
    code: "I·02",
    title: "Resample before you match",
    body:
      "Rather than trusting a detector's built-in scale invariance across a 300× gap, both frames are brought toward a common ground sampling distance first, then matched.",
  },
  {
    code: "I·03",
    title: "Two matching backends, one core",
    body:
      "A classical path (SIFT / ASIFT / AKAZE / RIFT2) for transparency and CPU-only environments, and a learned path (SuperPoint with SuperGlue or LightGlue) where a GPU is available.",
  },
  {
    code: "I·04",
    title: "Spread the control points on purpose",
    body:
      "Inliers are binned into a spatial grid over the overlap region and capped per cell, so the transform is fitted from points that cover the frame instead of one high-texture corner.",
  },
];

export function Approach() {
  return (
    <section id="approach" className="scroll-mt-24 border-t border-line/60">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <SectionHeading
          index="02"
          eyebrow="THE CORE IDEA"
          title="Solve correspondence first. Warping is the easy half."
          note="Once trustworthy point pairs exist, fitting and resampling are solved problems. Everything here is aimed at the pairs."
        />

        <div className="grid gap-px overflow-hidden rounded-xl bg-line/60 ring-1 ring-line/60 sm:grid-cols-2">
          {IDEAS.map((idea, i) => (
            <Reveal key={idea.code} delay={i * 0.06}>
              <article className="group h-full bg-void p-6 transition-colors hover:bg-surface sm:p-8">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] tracking-[0.16em] text-ash transition-colors group-hover:text-signal">
                    {idea.code}
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight text-bone">{idea.title}</h3>
                </div>
                <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-mist">{idea.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
