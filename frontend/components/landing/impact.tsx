import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const USES = [
  {
    label: "Landing-site analysis",
    body:
      "Hazard and slope assessment for future landers depends on high-resolution frames sitting correctly on the reference cartography.",
  },
  {
    label: "Cross-mission fusion",
    body:
      "Comparing Indian sensor data against LRO and SELENE products is how geolocation is validated and multi-sensor products are built.",
  },
  {
    label: "Change detection",
    body:
      "New craters, rover tracks and surface change can only be found once two epochs are in the same coordinate frame.",
  },
  {
    label: "Derived products",
    body:
      "DEMs, crater catalogues, boulder counts and IIRS mineral maps all inherit whatever registration error sits underneath them.",
  },
];

export function Impact() {
  return (
    <section className="border-t border-line/60 bg-surface/50">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <SectionHeading
          index="09"
          eyebrow="WHY IT MATTERS"
          title="Registration is infrastructure. Everything sits on top of it."
        />
        <div className="grid gap-px overflow-hidden rounded-xl bg-line/60 ring-1 ring-line/60 sm:grid-cols-2 lg:grid-cols-4">
          {USES.map((use, i) => (
            <Reveal key={use.label} delay={i * 0.05}>
              <div className="h-full bg-void p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.06em] text-signal">
                  {use.label}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-mist">{use.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
