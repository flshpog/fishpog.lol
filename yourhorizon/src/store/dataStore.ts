"use client";

import { create } from "zustand";
import type { DataCategory } from "@/types/common";

interface DataState {
  categoriesLoaded: Partial<Record<DataCategory, boolean>>;
  searchIndexReady: boolean;
  isFullyReady: boolean;
  loadingProgress: number;
  currentCategory: string | null;
  error: string | null;

  setCategoryLoaded: (category: DataCategory) => void;
  setSearchIndexReady: (ready: boolean) => void;
  setFullyReady: (ready: boolean) => void;
  setLoadingProgress: (progress: number) => void;
  setCurrentCategory: (category: string | null) => void;
  setError: (error: string | null) => void;
}

export const useDataStore = create<DataState>((set) => ({
  categoriesLoaded: {},
  searchIndexReady: false,
  isFullyReady: false,
  loadingProgress: 0,
  currentCategory: null,
  error: null,

  setCategoryLoaded: (category) =>
    set((s) => ({
      categoriesLoaded: { ...s.categoriesLoaded, [category]: true },
    })),
  setSearchIndexReady: (ready) => set({ searchIndexReady: ready }),
  setFullyReady: (ready) => set({ isFullyReady: ready }),
  setLoadingProgress: (progress) => set({ loadingProgress: progress }),
  setCurrentCategory: (category) => set({ currentCategory: category }),
  setError: (error) => set({ error }),
}));
