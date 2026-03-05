import type { StateStorage } from "zustand/middleware";
import { db } from "@/lib/db/database";

/**
 * Custom Zustand persistence adapter backed by Dexie.js kvStore table.
 * Avoids localStorage 5MB limit and uses async IndexedDB writes.
 */
export const dexieStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const row = await db.kvStore.get(name);
    return row?.value ?? null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await db.kvStore.put({ key: name, value });
  },
  removeItem: async (name: string): Promise<void> => {
    await db.kvStore.delete(name);
  },
};
