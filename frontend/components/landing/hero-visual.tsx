"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import Image from "next/image";
import sourceTile from "@/assets/lunar-source.jpg";
import referenceTile from "@/assets/lunar-reference.jpg";

/**
 * Schematic of the correspondence step: keypoints detected in the
 * Chandrayaan-2 source tile are tied to the same ground features in the
 * reference tile. The right-hand points are the left-hand points pushed
 * through a similarity transform (rotation + scale), which is exactly what
 * the pipeline solves for.
 */
const SOURCE_POINTS = [
    [22, 20],
    [66, 28],
    [38, 47],
    [78, 58],
    [28, 72],
    [58, 82],
] as const;

const ROTATION = (7 * Math.PI) / 180;
const SCALE = 0.78;
const TILE = 96;
const GAP = 8;

function project([x, y]: readonly [number, number]) {
    const cx = TILE / 2;
    const cy = TILE / 2;
    const dx = x - cx;
    const dy = y - cy;
    return [
        TILE + GAP + cx + (dx * Math.cos(ROTATION) - dy * Math.sin(ROTATION)) * SCALE,
        cy + (dx * Math.sin(ROTATION) + dy * Math.cos(ROTATION)) * SCALE + 3,
    ] as const;
}

export function HeroVisual() {
    const reduced = useReducedMotion();

    const pairs = useMemo(
        () =>
            SOURCE_POINTS.map((p) => ({
                from: p,
                to: project(p),
            })),
        [],
    );

    return (
        <div className="relative">
            <div
                aria-hidden
                className="panel-glass absolute -inset-3 hidden rounded-xl opacity-60 sm:block"
                style={{ transform: "skewY(-1.5deg) skewX(-0.6deg)" }}
            />
            <div className="panel-glass relative overflow-hidden rounded-xl p-3 ring-1 ring-white/10">
                <div className="flex items-center justify-between px-1 pb-2 font-mono text-[10px] tracking-[0.14em] text-ash">
                    <span>SOURCE · CH-2 OHRC</span>
                    <span className="text-signal">REFERENCE · LRO NAC</span>
                </div>

                <div className="relative">
                    <div className="grid grid-cols-2 gap-2">
                        <figure className="relative overflow-hidden rounded-md bg-panel">
                            <Image
                                src={sourceTile}
                                alt="High-resolution lunar surface tile with long shadows, standing in for a Chandrayaan-2 OHRC frame"
                                className="aspect-square w-full object-cover contrast-110"
                            />
                            <figcaption className="absolute left-1.5 top-1.5 rounded bg-void/70 px-1.5 py-0.5 font-mono text-[9px] text-mist">
                                SRC · moving
                            </figcaption>
                        </figure>
                        <figure className="relative overflow-hidden rounded-md bg-panel">
                            <Image
                                src={referenceTile}
                                alt="Coarser lunar surface tile under different illumination, standing in for an LRO NAC reference frame"
                                className="aspect-square w-full object-cover opacity-90"
                                style={{ transform: `rotate(-${7}deg) scale(1.06)` }}
                            />
                            <figcaption className="absolute left-1.5 top-1.5 rounded bg-void/70 px-1.5 py-0.5 font-mono text-[9px] text-mist">
                                REF · fixed
                            </figcaption>
                        </figure>
                    </div>

                    <svg
                        aria-hidden
                        viewBox={`0 0 ${TILE * 2 + GAP} ${TILE}`}
                        preserveAspectRatio="none"
                        className="pointer-events-none absolute inset-0 h-full w-full"
                    >
                        {pairs.map((pair, i) => (
                            <motion.line
                                key={i}
                                x1={pair.from[0]}
                                y1={pair.from[1]}
                                x2={pair.to[0]}
                                y2={pair.to[1]}
                                stroke="var(--signal)"
                                strokeWidth={0.6}
                                vectorEffect="non-scaling-stroke"
                                strokeOpacity={0.75}
                                initial={reduced ? false : { pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.5 + i * 0.12, ease: "easeOut" }}
                            />
                        ))}
                        {pairs.map((pair, i) => (
                            <g key={`p-${i}`}>
                                <motion.circle
                                    cx={pair.from[0]}
                                    cy={pair.from[1]}
                                    r={1.6}
                                    fill="var(--signal)"
                                    initial={reduced ? false : { scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3, delay: 0.4 + i * 0.12 }}
                                    style={{ transformOrigin: `${pair.from[0]}px ${pair.from[1]}px` }}
                                />
                                <motion.circle
                                    cx={pair.to[0]}
                                    cy={pair.to[1]}
                                    r={1.6}
                                    fill="var(--flare)"
                                    initial={reduced ? false : { scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3, delay: 1.2 + i * 0.12 }}
                                    style={{ transformOrigin: `${pair.to[0]}px ${pair.to[1]}px` }}
                                />
                            </g>
                        ))}
                    </svg>
                </div>

                <dl className="mt-3 grid grid-cols-3 gap-2 font-mono text-[10px]">
                    <div className="rounded-md bg-void/50 px-2 py-1.5">
                        <dt className="text-ash">GSD SRC</dt>
                        <dd className="tabular text-bone">0.25 m/px</dd>
                    </div>
                    <div className="rounded-md bg-void/50 px-2 py-1.5">
                        <dt className="text-ash">GSD REF</dt>
                        <dd className="tabular text-bone">0.5–2 m/px</dd>
                    </div>
                    <div className="rounded-md bg-void/50 px-2 py-1.5">
                        <dt className="text-signal">MODEL</dt>
                        <dd className="text-signal">homography</dd>
                    </div>
                </dl>
                <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-void/70">
                    <div className="sweep-bar h-full w-1/4" />
                </div>
                <p className="mt-2 px-1 font-mono text-[9px] leading-relaxed text-ash">
                    Schematic. Tiles are illustrative renders; the geometry shown is the
                    similarity transform the matcher solves for.
                </p>
            </div>
        </div>
    );
}
