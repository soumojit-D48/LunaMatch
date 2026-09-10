"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import sourceTile from "@/assets/lunar-source.jpg";
import referenceTile from "@/assets/lunar-reference.jpg";

/**
 * Drag-to-compare: the same source frame overlaid on the reference, left of
 * the handle as acquired (offset, rotated, scaled) and right of the handle
 * after the fitted transform has been applied.
 */
export function Alignment() {
    const [pos, setPos] = useState(42);
    const frameRef = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);

    const setFromClientX = useCallback((clientX: number) => {
        const el = frameRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const next = ((clientX - rect.left) / rect.width) * 100;
        setPos(Math.min(96, Math.max(4, next)));
    }, []);

    return (
        <section id="alignment" className="scroll-mt-24 border-t border-line/60">
            <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
                <SectionHeading
                    index="05"
                    eyebrow="ALIGNMENT"
                    title="Drag the handle and watch the rims settle."
                    note="Left of the handle: the source as acquired. Right: the same source after the fitted transform."
                />

                <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
                    <Reveal>
                        <div
                            ref={frameRef}
                            className="relative aspect-[4/3] w-full touch-none select-none overflow-hidden rounded-xl bg-panel ring-1 ring-white/10"
                            onPointerDown={(e) => {
                                dragging.current = true;
                                e.currentTarget.setPointerCapture(e.pointerId);
                                setFromClientX(e.clientX);
                            }}
                            onPointerMove={(e) => {
                                if (dragging.current) setFromClientX(e.clientX);
                            }}
                            onPointerUp={() => {
                                dragging.current = false;
                            }}
                            onPointerCancel={() => {
                                dragging.current = false;
                            }}
                        >
                            <Image
                                src={referenceTile}
                                alt="Lunar reference frame used as the fixed coordinate system"
                                className="absolute inset-0 h-full w-full object-cover"
                            />

                            {/* source as acquired — misregistered */}
                            <div
                                className="absolute inset-0 overflow-hidden"
                                style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
                            >
                                <Image
                                    src={sourceTile}
                                    alt="Source frame before registration, visibly offset against the reference"
                                    className="absolute inset-0 h-full w-full object-cover opacity-55 mix-blend-screen"
                                    style={{ transform: "translate(4.5%, -3.5%) rotate(6deg) scale(1.14)" }}
                                />
                            </div>

                            {/* source after the fitted transform — registered */}
                            <div
                                className="absolute inset-0 overflow-hidden"
                                style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
                            >
                                <Image
                                    src={sourceTile}
                                    alt="Source frame after registration, aligned with the reference"
                                    className="absolute inset-0 h-full w-full object-cover opacity-55 mix-blend-screen"
                                />
                            </div>

                            <div aria-hidden className="fiducial-grid pointer-events-none absolute inset-0" />

                            <div
                                className="pointer-events-none absolute inset-y-0 w-px bg-signal"
                                style={{ left: `${pos}%` }}
                            >
                                <span className="absolute left-1/2 top-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-signal font-mono text-[11px] text-void shadow-lg">
                                    ‹›
                                </span>
                            </div>

                            <span className="pointer-events-none absolute left-3 top-3 rounded bg-void/75 px-2 py-1 font-mono text-[10px] text-mist">
                                AS ACQUIRED
                            </span>
                            <span className="pointer-events-none absolute right-3 top-3 rounded bg-void/75 px-2 py-1 font-mono text-[10px] text-signal">
                                REGISTERED
                            </span>

                            <label className="sr-only" htmlFor="alignment-slider">
                                Comparison position
                            </label>
                            <input
                                id="alignment-slider"
                                type="range"
                                min={4}
                                max={96}
                                value={Math.round(pos)}
                                onChange={(e) => setPos(Number(e.target.value))}
                                className="absolute bottom-3 left-1/2 h-1 w-2/3 -translate-x-1/2 cursor-pointer appearance-none rounded-full bg-line accent-[var(--signal)]"
                            />
                        </div>
                    </Reveal>

                    <Reveal delay={0.1}>
                        <div className="flex h-full flex-col justify-center">
                            <h3 className="text-lg font-semibold tracking-tight text-bone">
                                What the output actually contains
                            </h3>
                            <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-mist">
                                The problem statement asks for three things. Everything else the
                                pipeline produces exists to make those three defensible.
                            </p>
                            <ol className="mt-6 space-y-4 font-mono text-xs">
                                <li className="border-l-2 border-signal/60 pl-4">
                                    <div className="text-signal">01 · REGISTERED PRODUCT</div>
                                    <p className="mt-1 font-sans text-sm text-mist">
                                        The source frame resampled into the reference&rsquo;s coordinate grid.
                                    </p>
                                </li>
                                <li className="border-l-2 border-line pl-4">
                                    <div className="text-ash">02 · MATCH POINTS</div>
                                    <p className="mt-1 font-sans text-sm text-mist">
                                        Sub-pixel (x_src, y_src) ↔ (x_ref, y_ref) pairs with a confidence
                                        score and an inlier flag on each.
                                    </p>
                                </li>
                                <li className="border-l-2 border-line pl-4">
                                    <div className="text-ash">03 · EVALUATION REPORT</div>
                                    <p className="mt-1 font-sans text-sm text-mist">
                                        RMSE, inlier count, inlier ratio, coverage diagnostic, processing
                                        time, and the estimated transform parameters.
                                    </p>
                                </li>
                            </ol>
                            <p className="mt-6 font-mono text-[10px] leading-relaxed text-ash">
                                Comparison above uses illustrative renders — a demonstration of the
                                registration behaviour, not measured output.
                            </p>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
