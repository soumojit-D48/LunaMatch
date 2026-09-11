import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light";

type ThemeState = {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
};

export const THEME_STORAGE_KEY = "lunarsync-theme";

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      toggle: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: THEME_STORAGE_KEY },
  ),
);
