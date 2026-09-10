import { create } from "zustand";

type BootState = {
  booted: boolean;
  setBooted: () => void;
};

export const useBootStore = create<BootState>()((set) => ({
  booted: false,
  setBooted: () => set({ booted: true }),
}));
