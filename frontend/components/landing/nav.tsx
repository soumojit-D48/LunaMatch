"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "#problem", label: "Problem" },
  { href: "#approach", label: "Approach" },
  { href: "#pipeline", label: "Pipeline" },
  { href: "#alignment", label: "Alignment" },
  { href: "#architecture", label: "Architecture" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = LINKS.map((l) => document.querySelector(l.href)).filter(
      (el): el is Element => Boolean(el),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-line/60 bg-void/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex items-center justify-between py-4">
          <a href="#top" className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-md bg-signal/15 ring-1 ring-signal/30">
              <span className="reticle size-2 rounded-full bg-signal" />
            </span>
            <span className="leading-none">
              <span className="block text-sm font-semibold tracking-tight">LunaMatch</span>
              <span className="block font-mono text-[10px] tracking-[0.2em] text-ash">
                SIH 26166
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 font-mono text-xs text-mist md:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`relative py-1 transition-colors hover:text-bone ${
                  active === l.href ? "text-bone" : ""
                }`}
              >
                {l.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-px bg-signal transition-all duration-300 ${
                    active === l.href ? "w-full" : "w-0"
                  }`}
                />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#deliverables"
              className="hidden rounded-md bg-bone px-4 py-2 font-mono text-xs font-medium text-void ring-1 ring-white/20 transition-colors hover:bg-white sm:inline-block"
            >
              Deliverables
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="grid size-9 place-items-center rounded-md text-mist ring-1 ring-line md:hidden"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center overflow-hidden border-y border-line/60 font-mono text-[10px] tracking-[0.15em] text-ash">
          <span className="whitespace-nowrap py-2 pr-4">ISRO · DEPT. OF SPACE</span>
          <span className="whitespace-nowrap border-l border-line/60 py-2 pl-4 pr-4">
            SOURCE OHRC / TMC-2 / IIRS
          </span>
          <span className="hidden whitespace-nowrap border-l border-line/60 py-2 pl-4 pr-4 sm:inline">
            REFERENCE LRO NAC / SELENE
          </span>
          <span className="ml-auto hidden whitespace-nowrap border-l border-line/60 py-2 pl-4 text-signal lg:inline">
            SUB-PIXEL REGISTRATION
          </span>
        </div>
      </div>

      {open ? (
        <nav className="border-b border-line/60 bg-void/95 px-5 py-3 font-mono text-sm md:hidden">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block border-b border-line/40 py-3 text-mist last:border-0"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#deliverables"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-md bg-bone px-4 py-2 text-center text-xs font-medium text-void"
          >
            Deliverables
          </a>
        </nav>
      ) : null}
    </header>
  );
}
