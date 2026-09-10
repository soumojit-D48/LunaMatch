"use client";

import { useEffect, useState, type MouseEvent as ReactMouseEvent } from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/theme-store";

/** Syncs the persisted theme to <html> as a `light` class. Render once. */
export function ThemeInit() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  return null;
}

type ViewTransition = {
  ready: Promise<void>;
};

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => ViewTransition;
};

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <span className="size-9 rounded-md ring-1 ring-line" aria-hidden />;
  }

  const light = theme === "light";

  const handleToggle = (e: ReactMouseEvent<HTMLButtonElement>) => {
    const apply = () => {
      toggle();
      document.documentElement.classList.toggle(
        "light",
        useThemeStore.getState().theme === "light",
      );
    };

    const doc = document as DocumentWithViewTransition;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!doc.startViewTransition || reduceMotion) {
      apply();
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = doc.startViewTransition(apply);
    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 700,
            easing: "cubic-bezier(0.22, 0.61, 0.36, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {});
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      title={light ? "Switch to dark mode" : "Switch to light mode"}
      className="grid size-9 place-items-center rounded-md text-mist ring-1 ring-line transition-colors hover:text-bone hover:ring-mist"
    >
      {light ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </button>
  );
}

