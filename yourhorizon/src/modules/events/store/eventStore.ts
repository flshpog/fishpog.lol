"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dexieStorage } from "@/lib/storage/dexieStorage";

export interface CustomEvent {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  description: string;
}

interface EventState {
  selectedMonth: number | null;
  viewMode: "list" | "calendar";
  customEvents: CustomEvent[];

  setSelectedMonth: (month: number | null) => void;
  setViewMode: (mode: "list" | "calendar") => void;
  addCustomEvent: (event: CustomEvent) => void;
  removeCustomEvent: (id: string) => void;
}

export const useEventStore = create<EventState>()(
  persist(
    (set) => ({
      selectedMonth: null,
      viewMode: "list",
      customEvents: [],

      setSelectedMonth: (month) => set({ selectedMonth: month }),
      setViewMode: (mode) => set({ viewMode: mode }),
      addCustomEvent: (event) =>
        set((s) => ({ customEvents: [...s.customEvents, event] })),
      removeCustomEvent: (id) =>
        set((s) => ({ customEvents: s.customEvents.filter((e) => e.id !== id) })),
    }),
    {
      name: "yh-events",
      storage: createJSONStorage(() => dexieStorage),
      partialize: (state) => ({
        customEvents: state.customEvents,
      }),
    }
  )
);
