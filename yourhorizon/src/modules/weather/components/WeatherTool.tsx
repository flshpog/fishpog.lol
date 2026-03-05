"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useWeatherStore } from "../store/weatherStore";
import type { WeatherObservation } from "../store/weatherStore";
import {
  Hemisphere,
  Weather,
  Pattern,
  PATTERNS,
  getPattern,
  isHeavyShowerPattern,
  isLightShowerPattern,
  getRainbowInfo,
  getPatternKind,
  PatternKind,
} from "../lib/meteonook";
import { searchSeeds, type SearchObservation } from "../lib/seedSearch";

const FORECAST_DAYS = 14;

const WEATHER_NAMES: Record<number, string> = {
  0: "Clear",
  1: "Sunny",
  2: "Cloudy",
  3: "Rain Clouds",
  4: "Rain",
  5: "Heavy Rain",
};

const WEATHER_COLORS: Record<number, string> = {
  0: "#fbbf24",
  1: "#f59e0b",
  2: "#9ca3af",
  3: "#6b7280",
  4: "#60a5fa",
  5: "#3b82f6",
};

const PATTERN_KIND_LABELS: Record<number, string> = {
  [PatternKind.Fine]: "Clear/Fine",
  [PatternKind.Cloud]: "Cloudy",
  [PatternKind.Rain]: "Rainy",
  [PatternKind.FineCloud]: "Clear → Cloudy",
  [PatternKind.CloudFine]: "Cloudy → Clear",
  [PatternKind.FineRain]: "Clear → Rain",
  [PatternKind.CloudRain]: "Cloudy → Rain",
  [PatternKind.RainCloud]: "Rain → Cloudy",
  [PatternKind.Commun]: "Common",
  [PatternKind.EventDay]: "Event Day",
};

function WeatherDot({ weather, size = "md" }: { weather: number; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-3 h-3" : "w-5 h-5";
  return (
    <span
      className={`${dim} rounded-full inline-block flex-shrink-0`}
      style={{ backgroundColor: WEATHER_COLORS[weather] ?? "#444" }}
      title={WEATHER_NAMES[weather]}
    />
  );
}

/* ─── Observation Day Card ────────────────────────────────── */
function ObservationCard({ obs }: { obs: WeatherObservation }) {
  const { setHourWeather, setShootingStars, removeObservation } = useWeatherStore();
  const date = new Date(obs.date + "T12:00:00");
  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

  const cycleWeather = (hour: number) => {
    const current = obs.hourlyWeather[hour];
    if (current === null) setHourWeather(obs.id, hour, 0);
    else if (current < 5) setHourWeather(obs.id, hour, current + 1);
    else setHourWeather(obs.id, hour, null);
  };

  const observedCount = obs.hourlyWeather.filter((h) => h !== null).length;

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-sm font-semibold text-text">{dayName}</span>
          <span className="text-sm text-text-muted ml-2">{obs.date}</span>
          {observedCount > 0 && (
            <span className="text-[10px] text-text-muted ml-2">({observedCount} hours logged)</span>
          )}
        </div>
        <button
          onClick={() => removeObservation(obs.id)}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Remove
        </button>
      </div>

      {/* Hour grid - click to cycle weather type */}
      <div className="mb-2">
        <p className="text-[10px] text-text-muted mb-1">Click hours to set observed weather (cycles: Clear → Sunny → Cloudy → Rain Clouds → Rain → Heavy Rain → clear)</p>
        <div className="grid grid-cols-12 gap-0.5">
          {Array.from({ length: 24 }, (_, h) => {
            const w = obs.hourlyWeather[h];
            return (
              <button
                key={h}
                onClick={() => cycleWeather(h)}
                className="flex flex-col items-center py-1 rounded transition-colors hover:bg-bg-hover"
                title={w !== null ? `${h}:00 - ${WEATHER_NAMES[w]}` : `${h}:00 - Not observed`}
              >
                <span className="text-[9px] text-text-muted">{h}</span>
                <div
                  className="w-4 h-4 rounded-full mt-0.5 border border-white/10"
                  style={{
                    backgroundColor: w !== null ? WEATHER_COLORS[w] : "rgba(255,255,255,0.05)",
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Shooting stars */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px] text-text-muted">Shooting stars:</span>
        {(["unknown", "yes", "no"] as const).map((val) => (
          <button
            key={val}
            onClick={() => setShootingStars(obs.id, val)}
            className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
              obs.shootingStars === val
                ? "bg-primary-500 text-white"
                : "bg-bg-hover text-text-muted hover:bg-bg-input"
            }`}
          >
            {val === "unknown" ? "Didn't check" : val === "yes" ? "Saw stars" : "No stars"}
          </button>
        ))}
      </div>
    </Card>
  );
}

/* ─── Forecast Card ───────────────────────────────────────── */
function ForecastCard({
  dateStr,
  pattern,
  hemi,
  seed,
  expanded,
  onToggle,
}: {
  dateStr: string;
  pattern: Pattern;
  hemi: Hemisphere;
  seed: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const date = new Date(dateStr + "T12:00:00");
  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  const kind = getPatternKind(pattern);
  const rainbow = getRainbowInfo(hemi, seed, y, m, d, pattern);
  const hasStars = isHeavyShowerPattern(pattern) || isLightShowerPattern(pattern);

  return (
    <Card
      className="cursor-pointer hover:bg-bg-hover transition-colors"
      onClick={onToggle}
    >
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-sm font-semibold text-text">{dayName}</p>
          <p className="text-[10px] text-text-muted">{dateStr}</p>
        </div>
        <WeatherDot weather={PATTERNS[pattern][12]} />
      </div>
      <p className="text-xs text-text-secondary">{PATTERN_KIND_LABELS[kind] ?? Pattern[pattern]}</p>
      <div className="flex gap-1 mt-1.5 flex-wrap">
        {hasStars && (
          <Badge variant="donated">
            {isHeavyShowerPattern(pattern) ? "Heavy Shower" : "Light Shower"}
          </Badge>
        )}
        {rainbow.count > 0 && (
          <Badge variant="collected">
            {rainbow.count === 2 ? "Double Rainbow" : "Rainbow"} @ {rainbow.hour}:00
          </Badge>
        )}
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="grid grid-cols-12 gap-0.5 text-center">
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                className="text-[9px]"
                title={`${h}:00 - ${WEATHER_NAMES[PATTERNS[pattern][h]]}`}
              >
                <span className="text-text-muted">{h}</span>
                <div className="flex justify-center mt-0.5">
                  <WeatherDot weather={PATTERNS[pattern][h]} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

/* ─── Main Component ──────────────────────────────────────── */
export function WeatherTool() {
  const {
    hemisphere,
    setHemisphere,
    seed,
    setSeed,
    observations,
    addObservation,
  } = useWeatherStore();

  const [dateInput, setDateInput] = useState(new Date().toISOString().slice(0, 10));
  const [seedInput, setSeedInput] = useState(seed?.toString() ?? "");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // Search state
  const [searching, setSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [foundSeeds, setFoundSeeds] = useState<number[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const hemi = hemisphere === "north" ? Hemisphere.Northern : Hemisphere.Southern;

  const handleSetSeed = () => {
    const num = parseInt(seedInput, 10);
    if (!isNaN(num) && num >= 0 && num <= 2147483647) {
      setSeed(num);
    }
  };

  const handleSearch = useCallback(async () => {
    // Build observations for search
    const searchObs: SearchObservation[] = observations
      .filter((o) => o.hourlyWeather.some((h) => h !== null))
      .map((o) => {
        const d = new Date(o.date + "T12:00:00");
        const hours = new Map<number, number>();
        o.hourlyWeather.forEach((w, h) => {
          if (w !== null) hours.set(h, w);
        });
        return {
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          day: d.getDate(),
          hours,
          shootingStars: o.shootingStars,
        };
      });

    if (searchObs.length === 0) return;

    const abort = new AbortController();
    abortRef.current = abort;
    setSearching(true);
    setProgress(0);
    setFoundSeeds([]);

    await searchSeeds(
      hemi,
      searchObs,
      (pct, found) => {
        setProgress(pct);
        setFoundSeeds([...found]);
      },
      abort.signal
    );

    setSearching(false);
  }, [observations, hemi]);

  const handleStop = () => {
    abortRef.current?.abort();
    setSearching(false);
  };

  const handleUseSeed = (s: number) => {
    setSeed(s);
    setSeedInput(s.toString());
  };

  // Forecast
  const forecast = useMemo(() => {
    if (seed === null) return [];
    const results: { dateStr: string; pattern: Pattern }[] = [];
    const start = new Date();
    for (let d = 0; d < FORECAST_DAYS; d++) {
      const date = new Date(start);
      date.setDate(date.getDate() + d);
      const y = date.getFullYear();
      const m = date.getMonth() + 1;
      const day = date.getDate();
      const pattern = getPattern(hemi, seed, y, m, day);
      results.push({ dateStr: date.toISOString().slice(0, 10), pattern });
    }
    return results;
  }, [seed, hemi]);

  const totalObservedHours = observations.reduce(
    (sum, o) => sum + o.hourlyWeather.filter((h) => h !== null).length,
    0
  );

  return (
    <div className="space-y-4">
      {/* Hemisphere */}
      <Card>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-text">Hemisphere:</span>
          {(["north", "south"] as const).map((h) => (
            <button
              key={h}
              onClick={() => setHemisphere(h)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                hemisphere === h
                  ? "bg-primary-500 text-white"
                  : "bg-bg-hover text-text hover:bg-bg-input"
              }`}
            >
              {h === "north" ? "Northern" : "Southern"}
            </button>
          ))}
        </div>
      </Card>

      {/* Seed Finder */}
      <div>
        <h2 className="text-lg font-bold text-text mb-2">Find Your Seed</h2>
        <Card className="mb-3">
          <p className="text-xs text-text-secondary mb-3">
            Record the weather you observe at specific hours over several days.
            Click each hour cell to cycle through weather types. The more observations
            you log, the faster the search narrows down your seed.
            Aim for 5+ days with 3+ hours each for best results.
          </p>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-[10px] text-text-muted block mb-1">Add observation day</label>
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-bg-input border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={() => addObservation(dateInput)}
              className="px-4 py-1.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              Add Day
            </button>
          </div>
        </Card>

        {/* Observations list */}
        {observations.length > 0 && (
          <div className="space-y-2 mb-3">
            {observations.map((obs) => (
              <ObservationCard key={obs.id} obs={obs} />
            ))}
          </div>
        )}

        {/* Search controls */}
        {observations.length > 0 && (
          <Card>
            <div className="flex items-center gap-3 flex-wrap">
              {!searching ? (
                <button
                  onClick={handleSearch}
                  disabled={totalObservedHours === 0}
                  className="px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-30"
                >
                  Search for Seed
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors"
                >
                  Stop Search
                </button>
              )}
              <span className="text-xs text-text-muted">
                {totalObservedHours} hours logged across {observations.length} day{observations.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Progress */}
            {(searching || foundSeeds.length > 0) && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                  <span>{searching ? "Searching..." : "Search complete"}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-bg-hover rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 transition-all duration-200 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {foundSeeds.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-xs font-semibold text-text">
                      Found {foundSeeds.length} candidate{foundSeeds.length !== 1 ? "s" : ""}:
                    </p>
                    {foundSeeds.slice(0, 20).map((s) => (
                      <div
                        key={s}
                        className="flex items-center justify-between bg-bg-hover rounded-lg px-3 py-1.5"
                      >
                        <span className="text-sm text-text font-mono">{s}</span>
                        <button
                          onClick={() => handleUseSeed(s)}
                          className="text-xs text-primary-500 hover:underline"
                        >
                          Use This Seed
                        </button>
                      </div>
                    ))}
                    {foundSeeds.length > 20 && (
                      <p className="text-[10px] text-text-muted">
                        +{foundSeeds.length - 20} more. Add more observations to narrow it down.
                      </p>
                    )}
                  </div>
                )}

                {!searching && foundSeeds.length === 0 && progress >= 100 && (
                  <p className="text-xs text-red-400 mt-2">
                    No matching seeds found. Double-check your observations and try again.
                  </p>
                )}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Manual seed entry */}
      <Card>
        <h3 className="text-sm font-semibold text-text mb-2">Already know your seed?</h3>
        <div className="flex gap-2">
          <input
            type="number"
            value={seedInput}
            onChange={(e) => setSeedInput(e.target.value)}
            placeholder="e.g. 1234567890"
            min={0}
            max={2147483647}
            className="flex-1 px-3 py-2 rounded-lg bg-bg-input border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleSetSeed}
            className="px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            Set Seed
          </button>
          {seed !== null && (
            <button
              onClick={() => {
                setSeed(null);
                setSeedInput("");
              }}
              className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        {seed !== null && (
          <p className="text-xs text-primary-500 mt-2">Active seed: {seed}</p>
        )}
      </Card>

      {/* Forecast */}
      {forecast.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-text mb-2">{FORECAST_DAYS}-Day Forecast</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {forecast.map((f) => (
              <ForecastCard
                key={f.dateStr}
                dateStr={f.dateStr}
                pattern={f.pattern}
                hemi={hemi}
                seed={seed!}
                expanded={expandedDay === f.dateStr}
                onToggle={() =>
                  setExpandedDay(expandedDay === f.dateStr ? null : f.dateStr)
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <Card>
        <h3 className="text-sm font-semibold text-text mb-2">Weather Types</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {Object.entries(WEATHER_NAMES).map(([val, name]) => (
            <div key={val} className="flex items-center gap-1.5">
              <WeatherDot weather={Number(val)} size="sm" />
              <span className="text-xs text-text-secondary">{name}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Help */}
      <Card>
        <h3 className="text-sm font-semibold text-text mb-2">How it works</h3>
        <ol className="text-xs text-text-secondary space-y-1 list-decimal list-inside">
          <li>Add observation days using the date picker above</li>
          <li>For each day, click the hour cells to record the weather you saw</li>
          <li>
            Weather changes hourly in ACNH - note Clear vs Sunny (some clouds),
            Cloudy vs Rain Clouds (darker), Rain vs Heavy Rain
          </li>
          <li>Log 5+ days with 3-4 hours each for best results</li>
          <li>Click &quot;Search for Seed&quot; to brute-force all 2.1 billion possible seeds</li>
          <li>The search may take several minutes - more observations = faster narrowing</li>
        </ol>
      </Card>
    </div>
  );
}
