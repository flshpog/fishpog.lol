"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dexieStorage } from "@/lib/storage/dexieStorage";

interface ProfileState {
  characterName: string;
  islandName: string;
  switchCode: string;
  creatorCode: string;
  profileImage: string | null;

  setCharacterName: (name: string) => void;
  setIslandName: (name: string) => void;
  setSwitchCode: (code: string) => void;
  setCreatorCode: (code: string) => void;
  setProfileImage: (image: string | null) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      characterName: "",
      islandName: "",
      switchCode: "",
      creatorCode: "",
      profileImage: null,

      setCharacterName: (name) => set({ characterName: name }),
      setIslandName: (name) => set({ islandName: name }),
      setSwitchCode: (code) => set({ switchCode: code }),
      setCreatorCode: (code) => set({ creatorCode: code }),
      setProfileImage: (image) => set({ profileImage: image }),
    }),
    {
      name: "yh-profile",
      storage: createJSONStorage(() => dexieStorage),
    }
  )
);
