"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dexieStorage } from "@/lib/storage/dexieStorage";

interface VisitLogEntry {
  id: string;
  npcId: string;
  visitDate: string;
}

interface VisitorState {
  visitLog: VisitLogEntry[];

  addVisit: (npcId: string, date: string) => void;
  removeVisit: (id: string) => void;
}

export const useVisitorStore = create<VisitorState>()(
  persist(
    (set) => ({
      visitLog: [],

      addVisit: (npcId, date) =>
        set((s) => ({
          visitLog: [
            ...s.visitLog,
            { id: `${npcId}-${date}`, npcId, visitDate: date },
          ],
        })),
      removeVisit: (id) =>
        set((s) => ({
          visitLog: s.visitLog.filter((v) => v.id !== id),
        })),
    }),
    {
      name: "yh-visitors",
      storage: createJSONStorage(() => dexieStorage),
    }
  )
);
