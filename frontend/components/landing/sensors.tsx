import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

type Sensor = {
  name: string;
  role: "SOURCE" | "REFERENCE";
  mission: string;
  gsd: number;
  note: string;
};

const SENSORS: Sensor[] = [
  {
    name: "OHRC",
    role: "SOURCE",
    mission: "Chandrayaan-2",
    gsd: 0.25,
    note: "Highest-resolution optical frames; one pixel is a quarter metre of ground.",
  },
  {
    name: "LRO NAC",
    role: "REFERENCE",
    mission: "LRO",
    gsd: 0.5,
    note: "The usual reference cartography for high-resolution registration.",
  },
  {
    name: "TMC-2",
    role: "SOURCE",
    mission: "Chandrayaan-2",
    gsd: 5,
    note: "Wide terrain mapping coverage, twenty times coarser than OHRC.",
  },
  {
    name: "SELENE TC",
    role: "REFERENCE",
    mission: "SELENE / Kaguya",
    gsd: 10,
    note: "Alternative reference where NAC coverage is thin.",
  },
  {
    name: "IIRS",
    role: "SOURCE",
    mission: "Chandrayaan-2",
    gsd: 80,
    note: "Hyperspectral cube; roughly 300x coarser than OHRC at the extreme.",
  },
];

// log scale so 0.25 m and 80 m can share one axis
const MIN = Math.log10(0.2);
const MAX = Math.log10(120);
const pct = (gsd: number) => ((Math.log10(gsd) - MIN) / (MAX - MIN)) * 100;

export function Sensors() {
  return (
    <section id="sensors" className="scroll-mt-24 border-t border-line/60">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <SectionHeading
          index="02"
          eyebrow="THE INSTRUMENTS"
          title="Five sensors, three orders of magnitude of ground sample distance."
          note="Axis is logarithmic. Nominal GSD values from the problem statement."
        />

        <Reveal>
          <div className="panel-glass overflow-hidden rounded-xl ring-1 ring-white/10">
            <div className="flex items-center justify-between border-b border-line/60 px-5 py-3 font-mono text-[10px] tracking-[0.16em] text-ash sm:px-8">
              <span>0.2 m/px</span>
              <span className="hidden sm:inline">GROUND SAMPLE DISTANCE</span>
              <span>120 m/px</span>
            </div>

            <div className="divide-y divide-line/40">
              {SENSORS.map((s, i) => (
                <Reveal key={s.name} delay={i * 0.05}>
                  <div className="grid gap-3 px-5 py-5 sm:grid-cols-[minmax(0,15rem)_1fr] sm:items-center sm:gap-6 sm:px-8">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-bone">{s.name}</span>
                        <span
                          className={`font-mono text-[10px] tracking-[0.14em] ${
                            s.role === "SOURCE" ? "text-signal" : "text-regolith"
                          }`}
                        >
                          {s.role}
                        </span>
                      </div>
                      <div className="mt-1 font-mono text-[10px] tracking-[0.14em] text-ash">
                        {s.mission}
                      </div>
                    </div>

                    <div>
                      <div className="relative h-8">
                        <div className="fiducial-grid absolute inset-0 rounded-md opacity-40" />
                        <div
                          className="absolute inset-y-1.5 left-0 rounded-sm"
                          style={{
                            width: `${pct(s.gsd)}%`,
                            background:
                              s.role === "SOURCE"
                                ? "linear-gradient(90deg, color-mix(in oklab, var(--signal) 12%, transparent), color-mix(in oklab, var(--signal) 55%, transparent))"
                                : "linear-gradient(90deg, color-mix(in oklab, var(--regolith) 10%, transparent), color-mix(in oklab, var(--regolith) 45%, transparent))",
                          }}
                        />
                        <div
                          className="absolute inset-y-0 w-px bg-bone/70"
                          style={{ left: `${pct(s.gsd)}%` }}
                        />
                        <span
                          className="tabular absolute -top-0.5 whitespace-nowrap font-mono text-[11px] text-bone"
                          style={
                            pct(s.gsd) > 78
                              ? { right: `calc(${100 - pct(s.gsd)}% + 8px)` }
                              : { left: `calc(${pct(s.gsd)}% + 8px)` }
                          }
                        >
                          {s.gsd} m/px
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-mist">{s.note}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
