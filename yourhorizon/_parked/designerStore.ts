"use client";

import { create } from "zustand";

type DesignerTool = "select" | "terrain" | "water" | "path" | "building" | "eraser";

interface DesignerState {
  activeTool: DesignerTool;
  gridVisible: boolean;
  viewMode: "2d" | "3d";

  setActiveTool: (tool: DesignerTool) => void;
  toggleGrid: () => void;
  setViewMode: (mode: "2d" | "3d") => void;
}

export const useDesignerStore = create<DesignerState>((set) => ({
  activeTool: "select",
  gridVisible: true,
  viewMode: "2d",

  setActiveTool: (tool) => set({ activeTool: tool }),
  toggleGrid: () => set((s) => ({ gridVisible: !s.gridVisible })),
  setViewMode: (mode) => set({ viewMode: mode }),
}));
