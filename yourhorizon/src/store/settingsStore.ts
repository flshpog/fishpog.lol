"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Hemisphere } from "@/types/common";
import { dexieStorage } from "@/lib/storage/dexieStorage";
import { detectTimezone } from "@/lib/utils/time";

interface SettingsState {
  hemisphere: Hemisphere;
  timezone: string;
  nativeFruit: string;

  setHemisphere: (hemisphere: Hemisphere) => void;
  setTimezone: (timezone: string) => void;
  setNativeFruit: (fruit: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      hemisphere: "northern",
      timezone: typeof window !== "undefined" ? detectTimezone() : "America/New_York",
      nativeFruit: "",

      setHemisphere: (hemisphere) => set({ hemisphere }),
      setTimezone: (timezone) => set({ timezone }),
      setNativeFruit: (fruit) => set({ nativeFruit: fruit }),
    }),
    {
      name: "yh-settings",
      storage: createJSONStorage(() => dexieStorage),
    }
  )
);
