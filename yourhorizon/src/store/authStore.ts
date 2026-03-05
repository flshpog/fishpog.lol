"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dexieStorage } from "@/lib/storage/dexieStorage";

interface AuthState {
  token: string | null;
  email: string | null;
  lastSyncAt: string | null;

  setAuth: (token: string, email: string) => void;
  setLastSync: (date: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      lastSyncAt: null,

      setAuth: (token, email) => set({ token, email }),
      setLastSync: (date) => set({ lastSyncAt: date }),
      logout: () => set({ token: null, email: null, lastSyncAt: null }),
    }),
    {
      name: "yh-auth",
      storage: createJSONStorage(() => dexieStorage),
    }
  )
);
