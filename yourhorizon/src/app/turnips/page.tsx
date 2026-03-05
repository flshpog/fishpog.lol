"use client";

import dynamic from "next/dynamic";

const TurnipCalculator = dynamic(
  () => import("@/modules/turnips/components/TurnipCalculator").then((m) => m.TurnipCalculator),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-3 border-border border-t-primary-500 rounded-full animate-spin" />
      </div>
    ),
  }
);

export default function TurnipsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text">Turnip Calculator</h1>
        <p className="text-text-secondary mt-1">
          Enter your turnip prices to predict patterns and find the best sell window.
        </p>
      </div>

      <TurnipCalculator />
    </div>
  );
}
