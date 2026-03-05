"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useTurnipStore } from "../store/turnipStore";
import { predictTurnips, DAY_LABELS, type PatternName } from "../lib/predictions";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PATTERN_OPTIONS: { label: string; value: PatternName | "" }[] = [
  { label: "Unknown", value: "" },
  { label: "Fluctuating", value: "fluctuating" },
  { label: "Large Spike", value: "large-spike" },
  { label: "Decreasing", value: "decreasing" },
  { label: "Small Spike", value: "small-spike" },
];

const PATTERN_COLORS: Record<string, string> = {
  "fluctuating": "bg-blue-500/20 text-blue-400",
  "large-spike": "bg-green-500/20 text-green-400",
  "decreasing": "bg-red-500/20 text-red-400",
  "small-spike": "bg-yellow-500/20 text-yellow-400",
};

export function TurnipCalculator() {
  const {
    currentWeek,
    previousPattern,
    setPurchasePrice,
    setPrice,
    setPreviousPattern,
    setFirstTime,
    resetWeek,
  } = useTurnipStore();

  const prediction = useMemo(() => {
    return predictTurnips(
      currentWeek.purchasePrice,
      currentWeek.prices,
      (previousPattern as PatternName) || null,
      currentWeek.isFirstTime
    );
  }, [currentWeek, previousPattern]);

  return (
    <div className="space-y-6">
      {/* Buy Price + Settings */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Buy Price (Sunday)</label>
            <input
              type="number"
              value={currentWeek.purchasePrice ?? ""}
              onChange={(e) => setPurchasePrice(e.target.value ? Number(e.target.value) : null)}
              placeholder="e.g. 100"
              className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Previous Pattern</label>
            <select
              value={previousPattern ?? ""}
              onChange={(e) => setPreviousPattern(e.target.value || null)}
              className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {PATTERN_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentWeek.isFirstTime}
                onChange={(e) => setFirstTime(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm text-text">First time buyer</span>
            </label>
            <button
              onClick={resetWeek}
              className="ml-auto px-3 py-2 text-xs rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </Card>

      {/* Price Entry Grid */}
      <Card>
        <h3 className="text-sm font-semibold text-text mb-3">Sell Prices</h3>
        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          <div />
          {DAYS.map((d) => (
            <div key={d} className="font-medium text-text-muted">{d}</div>
          ))}

          {/* AM Row */}
          <div className="text-text-muted font-medium flex items-center">AM</div>
          {DAYS.map((_, i) => (
            <input
              key={`am-${i}`}
              type="number"
              value={currentWeek.prices[i]?.am ?? ""}
              onChange={(e) => setPrice(i, "am", e.target.value ? Number(e.target.value) : null)}
              placeholder="—"
              className="w-full px-2 py-1.5 rounded bg-bg-input border border-border text-text text-xs text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          ))}

          {/* PM Row */}
          <div className="text-text-muted font-medium flex items-center">PM</div>
          {DAYS.map((_, i) => (
            <input
              key={`pm-${i}`}
              type="number"
              value={currentWeek.prices[i]?.pm ?? ""}
              onChange={(e) => setPrice(i, "pm", e.target.value ? Number(e.target.value) : null)}
              placeholder="—"
              className="w-full px-2 py-1.5 rounded bg-bg-input border border-border text-text text-xs text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          ))}
        </div>
      </Card>

      {/* Prediction Results */}
      {currentWeek.purchasePrice && prediction.patterns.length > 0 && (
        <>
          {/* Summary */}
          {prediction.bestDay && (
            <Card>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm text-text-muted">Best potential sell window</p>
                  <p className="text-lg font-bold text-text">
                    {prediction.bestDay.label} — up to {prediction.bestDay.max} bells
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted">Worst case</p>
                  <p className="text-sm font-medium text-red-400">{prediction.worstCase} bells</p>
                </div>
              </div>
            </Card>
          )}

          {/* Pattern Probabilities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prediction.patterns.map((pat) => (
              <Card key={pat.pattern}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-text">{pat.label}</h3>
                  <Badge className={PATTERN_COLORS[pat.pattern]}>
                    {(pat.probability * 100).toFixed(1)}%
                  </Badge>
                </div>

                {/* Mini price chart */}
                <div className="grid grid-cols-12 gap-px">
                  {pat.prices.map((range, i) => {
                    const maxPossible = currentWeek.purchasePrice! * 6;
                    const height = Math.max(8, (range.max / maxPossible) * 60);
                    const entered = i % 2 === 0
                      ? currentWeek.prices[Math.floor(i / 2)]?.am
                      : currentWeek.prices[Math.floor(i / 2)]?.pm;

                    return (
                      <div key={i} className="flex flex-col items-center gap-0.5">
                        <div
                          className={`w-full rounded-t ${entered != null ? "bg-primary-500" : "bg-primary-500/30"}`}
                          style={{ height: `${height}px` }}
                          title={`${DAY_LABELS[i]}: ${range.min}–${range.max}`}
                        />
                        {i % 2 === 0 && (
                          <span className="text-[8px] text-text-muted">{DAYS[i / 2]?.[0]}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between mt-2 text-xs text-text-muted">
                  <span>Min: {pat.guaranteedMin}</span>
                  <span>Max: {pat.potentialMax}</span>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {currentWeek.purchasePrice && prediction.patterns.length === 0 && (
        <Card>
          <p className="text-text-muted text-center py-4">
            No patterns match your entered prices. Double-check your values.
          </p>
        </Card>
      )}

      {!currentWeek.purchasePrice && (
        <Card>
          <p className="text-text-muted text-center py-4">
            Enter your Sunday buy price to start predicting.
          </p>
        </Card>
      )}
    </div>
  );
}
