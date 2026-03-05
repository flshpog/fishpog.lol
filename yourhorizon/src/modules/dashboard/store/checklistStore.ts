"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dexieStorage } from "@/lib/storage/dexieStorage";

interface ChecklistState {
  date: string;
  talkedTo: string[];
  fossils: boolean[];
  moneyTree: boolean;
  recipeBottle: boolean;
  rocks: boolean[];
  turnipAM: number | null;
  turnipPM: number | null;

  ensureToday: () => void;
  toggleTalked: (villagerId: string) => void;
  toggleFossil: (index: number) => void;
  toggleMoneyTree: () => void;
  toggleRecipeBottle: () => void;
  toggleRock: (index: number) => void;
  setTurnipAM: (price: number | null) => void;
  setTurnipPM: (price: number | null) => void;
}

const FRESH: Pick<
  ChecklistState,
  "talkedTo" | "fossils" | "moneyTree" | "recipeBottle" | "rocks" | "turnipAM" | "turnipPM"
> = {
  talkedTo: [],
  fossils: [false, false, false, false],
  moneyTree: false,
  recipeBottle: false,
  rocks: [false, false, false, false, false, false],
  turnipAM: null,
  turnipPM: null,
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export const useChecklistStore = create<ChecklistState>()(
  persist(
    (set, get) => ({
      date: todayStr(),
      ...FRESH,

      ensureToday: () => {
        const today = todayStr();
        if (get().date !== today) {
          set({ date: today, ...FRESH });
        }
      },

      toggleTalked: (villagerId) =>
        set((s) => {
          if (s.talkedTo.includes(villagerId)) {
            return { talkedTo: s.talkedTo.filter((id) => id !== villagerId) };
          }
          return { talkedTo: [...s.talkedTo, villagerId] };
        }),

      toggleFossil: (index) =>
        set((s) => {
          const next = [...s.fossils];
          next[index] = !next[index];
          return { fossils: next };
        }),

      toggleMoneyTree: () => set((s) => ({ moneyTree: !s.moneyTree })),
      toggleRecipeBottle: () => set((s) => ({ recipeBottle: !s.recipeBottle })),

      toggleRock: (index) =>
        set((s) => {
          const next = [...s.rocks];
          next[index] = !next[index];
          return { rocks: next };
        }),

      setTurnipAM: (price) => set({ turnipAM: price }),
      setTurnipPM: (price) => set({ turnipPM: price }),
    }),
    {
      name: "yh-checklist",
      storage: createJSONStorage(() => dexieStorage),
      partialize: (state) => ({
        date: state.date,
        talkedTo: state.talkedTo,
        fossils: state.fossils,
        moneyTree: state.moneyTree,
        recipeBottle: state.recipeBottle,
        rocks: state.rocks,
        turnipAM: state.turnipAM,
        turnipPM: state.turnipPM,
      }),
    }
  )
);
