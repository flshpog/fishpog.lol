"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dexieStorage } from "@/lib/storage/dexieStorage";

interface MysteryIslandState {
  visitedIslandIds: string[];

  toggleVisited: (id: string) => void;
}

export const useMysteryIslandStore = create<MysteryIslandState>()(
  persist(
    (set) => ({
      visitedIslandIds: [],

      toggleVisited: (id) =>
        set((s) => ({
          visitedIslandIds: s.visitedIslandIds.includes(id)
            ? s.visitedIslandIds.filter((i) => i !== id)
            : [...s.visitedIslandIds, id],
        })),
    }),
    {
      name: "yh-mystery-islands",
      storage: createJSONStorage(() => dexieStorage),
    }
  )
);
