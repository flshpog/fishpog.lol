"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dexieStorage } from "@/lib/storage/dexieStorage";
import type { TurnipWeekData } from "@/types/data";

interface TurnipState {
  currentWeek: TurnipWeekData;
  previousPattern: string | null;

  setPurchasePrice: (price: number | null) => void;
  setPrice: (dayIndex: number, period: "am" | "pm", price: number | null) => void;
  setPreviousPattern: (pattern: string | null) => void;
  setFirstTime: (isFirst: boolean) => void;
  resetWeek: () => void;
}

const EMPTY_WEEK: TurnipWeekData = {
  purchasePrice: null,
  previousPattern: null,
  isFirstTime: false,
  prices: Array.from({ length: 6 }, () => ({ am: null, pm: null })),
};

export const useTurnipStore = create<TurnipState>()(
  persist(
    (set) => ({
      currentWeek: { ...EMPTY_WEEK },
      previousPattern: null,

      setPurchasePrice: (price) =>
        set((s) => ({ currentWeek: { ...s.currentWeek, purchasePrice: price } })),
      setPrice: (dayIndex, period, price) =>
        set((s) => {
          const prices = [...s.currentWeek.prices];
          prices[dayIndex] = { ...prices[dayIndex], [period]: price };
          return { currentWeek: { ...s.currentWeek, prices } };
        }),
      setPreviousPattern: (pattern) => set({ previousPattern: pattern }),
      setFirstTime: (isFirst) =>
        set((s) => ({ currentWeek: { ...s.currentWeek, isFirstTime: isFirst } })),
      resetWeek: () => set({ currentWeek: { ...EMPTY_WEEK } }),
    }),
    {
      name: "yh-turnips",
      storage: createJSONStorage(() => dexieStorage),
    }
  )
);
