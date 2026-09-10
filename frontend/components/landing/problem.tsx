import Image from "next/image";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import axisSun from "@/assets/axis-sun.jpg";
import axisScale from "@/assets/axis-scale.jpg";
import axisViewpoint from "@/assets/axis-viewpoint.jpg";

const AXES = [
    {
        tag: "SUN ANGLE",
        variant: "AXIS 01",
        title: "Shadows rewrite the terrain",
        image: axisSun,
        alt: "Lunar terrain under very low sun elevation with long, hard shadows",
        body:
            "The Moon has no atmosphere, so shadows are absolute. The same crater is a bright bowl at high sun and a black silhouette at low sun — descriptors built on brightness stop agreeing.",
    },
    {
        tag: "SCALE",
        variant: "AXIS 02",
        title: "A crater 40 px wide, or under 1",
        image: axisScale,
        alt: "Wide-area lunar surface imaged at coarse resolution",
        body:
            "OHRC resolves ~0.25 m per pixel, LRO NAC 0.5–2 m, IIRS about 80 m. A 10 m crater spans 40 pixels in one frame and less than one in the other.",
    },
    {
        tag: "VIEWPOINT",
        variant: "AXIS 03",
        title: "Off-nadir geometry skews shape",
        image: axisViewpoint,
        alt: "Oblique view of lunar craters showing perspective distortion",
        body:
            "The two spacecraft rarely looked straight down in the same way. Circles become ellipses, so the match has to survive affine and projective distortion.",
    },
];

export function Problem() {
    return (
        <section id="problem" className="scroll-mt-24 border-t border-line/60 bg-surface/50">
            <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
                <SectionHeading
                    index="01"
                    eyebrow="THE PROBLEM"
                    title="The same patch of Moon, never the same picture."
                    note="Three confounders arrive at once — and every downstream product silently assumes they were handled."
                />

                <div className="grid gap-4 md:grid-cols-3">
                    {AXES.map((axis, i) => (
                        <Reveal key={axis.tag} delay={i * 0.08}>
                            <article className="panel-glass group h-full rounded-xl p-5 ring-1 ring-white/10">
                                <div className="flex items-center justify-between font-mono text-[10px] text-ash">
                                    <span>{axis.tag}</span>
                                    <span className="text-signal">{axis.variant}</span>
                                </div>
                                <div className="mt-3 overflow-hidden rounded-md bg-panel">
                                    <Image
                                        src={axis.image}
                                        alt={axis.alt}
                                        className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                                    />
                                </div>
                                <h3 className="mt-4 text-base font-semibold text-bone">{axis.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-mist">{axis.body}</p>
                            </article>
                        </Reveal>
                    ))}
                </div>

                <Reveal delay={0.1}>
                    <p className="mt-10 max-w-[70ch] border-l-2 border-signal/50 pl-5 text-pretty text-base leading-relaxed text-mist">
                        Get this wrong and the error propagates silently. Hazard maps, digital
                        elevation models, boulder counts and mineral maps all assume that
                        &ldquo;pixel (x, y) here&rdquo; and &ldquo;pixel (x, y) there&rdquo; are the
                        same square metre of the Moon. Chandrayaan-3&rsquo;s landing-site analysis
                        leaned on exactly that assumption.
                    </p>
                </Reveal>
            </div>
        </section>
    );
}
