"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dexieStorage } from "@/lib/storage/dexieStorage";

interface VillagerFilters {
  species: string;
  personality: string;
  hobby: string;
  gender: string;
}

interface VillagerState {
  islandVillagerIds: string[];
  favoriteVillagerIds: string[];
  activeFilters: VillagerFilters;
  selectedVillagerId: string | null;

  addToIsland: (id: string) => void;
  removeFromIsland: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setFilters: (filters: Partial<VillagerFilters>) => void;
  setSelectedVillager: (id: string | null) => void;
}

export const useVillagerStore = create<VillagerState>()(
  persist(
    (set) => ({
      islandVillagerIds: [],
      favoriteVillagerIds: [],
      activeFilters: { species: "", personality: "", hobby: "", gender: "" },
      selectedVillagerId: null,

      addToIsland: (id) =>
        set((s) => {
          if (s.islandVillagerIds.length >= 10) return s;
          if (s.islandVillagerIds.includes(id)) return s;
          return { islandVillagerIds: [...s.islandVillagerIds, id] };
        }),
      removeFromIsland: (id) =>
        set((s) => ({
          islandVillagerIds: s.islandVillagerIds.filter((v) => v !== id),
        })),
      toggleFavorite: (id) =>
        set((s) => ({
          favoriteVillagerIds: s.favoriteVillagerIds.includes(id)
            ? s.favoriteVillagerIds.filter((v) => v !== id)
            : [...s.favoriteVillagerIds, id],
        })),
      setFilters: (filters) =>
        set((s) => ({
          activeFilters: { ...s.activeFilters, ...filters },
        })),
      setSelectedVillager: (id) => set({ selectedVillagerId: id }),
    }),
    {
      name: "yh-villagers",
      storage: createJSONStorage(() => dexieStorage),
      partialize: (state) => ({
        islandVillagerIds: state.islandVillagerIds,
        favoriteVillagerIds: state.favoriteVillagerIds,
      }),
    }
  )
);
