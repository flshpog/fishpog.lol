"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dexieStorage } from "@/lib/storage/dexieStorage";
import type { CritterCategory } from "@/types/common";

interface MuseumState {
  caughtIds: Record<string, string[]>;
  donatedIds: Record<string, string[]>;
  activeCategory: CritterCategory;

  markCaught: (category: string, id: string) => void;
  unmarkCaught: (category: string, id: string) => void;
  markDonated: (category: string, id: string) => void;
  unmarkDonated: (category: string, id: string) => void;
  setActiveCategory: (category: CritterCategory) => void;
}

export const useMuseumStore = create<MuseumState>()(
  persist(
    (set) => ({
      caughtIds: {},
      donatedIds: {},
      activeCategory: "fish",

      markCaught: (category, id) =>
        set((s) => {
          const current = s.caughtIds[category] ?? [];
          if (current.includes(id)) return s;
          return { caughtIds: { ...s.caughtIds, [category]: [...current, id] } };
        }),
      unmarkCaught: (category, id) =>
        set((s) => ({
          caughtIds: {
            ...s.caughtIds,
            [category]: (s.caughtIds[category] ?? []).filter((i) => i !== id),
          },
        })),
      markDonated: (category, id) =>
        set((s) => {
          const currentDonated = s.donatedIds[category] ?? [];
          if (currentDonated.includes(id)) return s;
          // Auto-mark as caught if donating
          const currentCaught = s.caughtIds[category] ?? [];
          return {
            donatedIds: { ...s.donatedIds, [category]: [...currentDonated, id] },
            caughtIds: currentCaught.includes(id)
              ? s.caughtIds
              : { ...s.caughtIds, [category]: [...currentCaught, id] },
          };
        }),
      unmarkDonated: (category, id) =>
        set((s) => ({
          donatedIds: {
            ...s.donatedIds,
            [category]: (s.donatedIds[category] ?? []).filter((i) => i !== id),
          },
        })),
      setActiveCategory: (category) => set({ activeCategory: category }),
    }),
    {
      name: "yh-museum",
      storage: createJSONStorage(() => dexieStorage),
      partialize: (state) => ({
        caughtIds: state.caughtIds,
        donatedIds: state.donatedIds,
      }),
    }
  )
);
