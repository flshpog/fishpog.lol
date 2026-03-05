"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dexieStorage } from "@/lib/storage/dexieStorage";
import type { CollectionCategory } from "@/types/common";

interface CollectionState {
  collectedIds: Record<string, string[]>;
  activeCategory: CollectionCategory;

  toggleCollected: (category: string, id: string) => void;
  setActiveCategory: (category: CollectionCategory) => void;
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set) => ({
      collectedIds: {},
      activeCategory: "items",

      toggleCollected: (category, id) =>
        set((s) => {
          const current = s.collectedIds[category] ?? [];
          return {
            collectedIds: {
              ...s.collectedIds,
              [category]: current.includes(id)
                ? current.filter((i) => i !== id)
                : [...current, id],
            },
          };
        }),
      setActiveCategory: (category) => set({ activeCategory: category }),
    }),
    {
      name: "yh-collections",
      storage: createJSONStorage(() => dexieStorage),
      partialize: (state) => ({
        collectedIds: state.collectedIds,
      }),
    }
  )
);
