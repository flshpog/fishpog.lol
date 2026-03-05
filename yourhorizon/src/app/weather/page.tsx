"use client";

import dynamic from "next/dynamic";

const WeatherTool = dynamic(
  () => import("@/modules/weather/components/WeatherTool").then((m) => m.WeatherTool),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-3 border-border border-t-primary-500 rounded-full animate-spin" />
      </div>
    ),
  }
);

export default function WeatherPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text">Weather Seed Tool</h1>
        <p className="text-text-secondary mt-1">
          Determine your island weather seed and predict future weather patterns.
        </p>
      </div>

      <WeatherTool />
    </div>
  );
}
