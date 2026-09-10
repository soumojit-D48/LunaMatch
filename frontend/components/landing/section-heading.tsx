import type { ReactNode } from "react";
import { Reveal } from "./reveal";

type SectionHeadingProps = {
  index: string;
  eyebrow: string;
  title: ReactNode;
  note?: string;
};

export function SectionHeading({ index, eyebrow, title, note }: SectionHeadingProps) {
  return (
    <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="font-mono text-[11px] tracking-[0.2em] text-signal">
          {index} — {eyebrow}
        </div>
        <h2 className="mt-3 max-w-[26ch] text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
      </div>
      {note ? (
        <p className="max-w-[34ch] font-mono text-xs leading-relaxed text-ash">{note}</p>
      ) : null}
    </Reveal>
  );
}
