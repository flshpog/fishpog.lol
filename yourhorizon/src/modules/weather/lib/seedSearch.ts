import {
  Hemisphere,
  getPattern,
  PATTERNS,
  Pattern,
  isHeavyShowerPattern,
  isLightShowerPattern,
} from "./meteonook";

export interface SearchObservation {
  year: number;
  month: number;
  day: number;
  /** hour -> Weather enum value (0-5). Only hours with observations. */
  hours: Map<number, number>;
  /** Whether user saw shooting stars, didn't, or didn't check */
  shootingStars: "yes" | "no" | "unknown";
}

function checkSeed(
  seed: number,
  hemi: Hemisphere,
  observations: SearchObservation[]
): boolean {
  for (const obs of observations) {
    const pattern = getPattern(hemi, seed, obs.year, obs.month, obs.day);

    // Check hourly weather matches
    for (const [hour, weather] of obs.hours) {
      if (PATTERNS[pattern][hour] !== weather) return false;
    }

    // Check shooting star consistency
    if (obs.shootingStars === "yes") {
      if (!isHeavyShowerPattern(pattern) && !isLightShowerPattern(pattern)) {
        return false;
      }
    }
    if (obs.shootingStars === "no") {
      if (isHeavyShowerPattern(pattern) || isLightShowerPattern(pattern)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Brute-force search through all possible seeds (0 to 2,147,483,647).
 * Runs in async chunks to keep the UI responsive.
 */
export async function searchSeeds(
  hemi: Hemisphere,
  observations: SearchObservation[],
  onProgress: (pct: number, found: number[]) => void,
  signal?: AbortSignal
): Promise<number[]> {
  const MAX_SEED = 0x7fffffff;
  const CHUNK_SIZE = 500_000;
  const MAX_RESULTS = 100;
  const found: number[] = [];

  for (let start = 0; start <= MAX_SEED; start += CHUNK_SIZE) {
    if (signal?.aborted) return found;

    const end = Math.min(start + CHUNK_SIZE, MAX_SEED + 1);
    for (let s = start; s < end; s++) {
      if (checkSeed(s, hemi, observations)) {
        found.push(s);
        if (found.length >= MAX_RESULTS) {
          onProgress(100, found);
          return found;
        }
      }
    }

    const pct = Math.min(99, Math.floor((end / MAX_SEED) * 100));
    onProgress(pct, [...found]);

    // Yield to main thread
    await new Promise((r) => setTimeout(r, 0));
  }

  onProgress(100, found);
  return found;
}
