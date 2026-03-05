"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dexieStorage } from "@/lib/storage/dexieStorage";

export interface WeatherObservation {
  id: string;
  date: string;
  /** 24 elements: Weather enum (0-5) or null for unobserved hours */
  hourlyWeather: (number | null)[];
  shootingStars: "yes" | "no" | "unknown";
}

interface WeatherState {
  hemisphere: "north" | "south";
  seed: number | null;
  observations: WeatherObservation[];

  setHemisphere: (h: "north" | "south") => void;
  setSeed: (seed: number | null) => void;
  addObservation: (date: string) => void;
  removeObservation: (id: string) => void;
  setHourWeather: (id: string, hour: number, weather: number | null) => void;
  setShootingStars: (id: string, value: "yes" | "no" | "unknown") => void;
}

export const useWeatherStore = create<WeatherState>()(
  persist(
    (set) => ({
      hemisphere: "north" as const,
      seed: null,
      observations: [],

      setHemisphere: (hemisphere) => set({ hemisphere }),
      setSeed: (seed) => set({ seed }),

      addObservation: (date) =>
        set((s) => {
          if (s.observations.some((o) => o.date === date)) return s;
          return {
            observations: [
              ...s.observations,
              {
                id: `obs-${Date.now()}`,
                date,
                hourlyWeather: Array(24).fill(null),
                shootingStars: "unknown" as const,
              },
            ].sort((a, b) => a.date.localeCompare(b.date)),
          };
        }),

      removeObservation: (id) =>
        set((s) => ({
          observations: s.observations.filter((o) => o.id !== id),
        })),

      setHourWeather: (id, hour, weather) =>
        set((s) => ({
          observations: s.observations.map((o) => {
            if (o.id !== id) return o;
            const hourly = [...o.hourlyWeather];
            hourly[hour] = weather;
            return { ...o, hourlyWeather: hourly };
          }),
        })),

      setShootingStars: (id, value) =>
        set((s) => ({
          observations: s.observations.map((o) =>
            o.id === id ? { ...o, shootingStars: value } : o
          ),
        })),
    }),
    {
      name: "yh-weather",
      storage: createJSONStorage(() => dexieStorage),
    }
  )
);
