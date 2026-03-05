"use client";

import { create } from "zustand";

interface FlowerState {
  selectedType: string;

  setSelectedType: (type: string) => void;
}

export const useFlowerStore = create<FlowerState>((set) => ({
  selectedType: "",

  setSelectedType: (type) => set({ selectedType: type }),
}));
