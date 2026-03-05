"use client";

import { useDataStore } from "@/store/dataStore";

export function useDataReady(): boolean {
  return useDataStore((s) => s.isFullyReady);
}
