/**
 * Turnip price prediction engine based on ACNH game data mining.
 * Implements the 4 known patterns: Fluctuating, Large Spike, Decreasing, Small Spike.
 *
 * Reference: https://github.com/mikebryant/ac-nh-turnip-prices
 */

export type PatternName = "fluctuating" | "large-spike" | "decreasing" | "small-spike";

export interface PriceRange {
  min: number;
  max: number;
}

export interface PatternPrediction {
  pattern: PatternName;
  label: string;
  probability: number;
  prices: PriceRange[]; // 12 half-day slots (Mon AM..Sat PM)
  guaranteedMin: number;
  potentialMax: number;
}

export interface TurnipPredictionResult {
  patterns: PatternPrediction[];
  bestDay: { index: number; label: string; max: number } | null;
  worstCase: number;
}

const DAY_LABELS = ["Mon AM", "Mon PM", "Tue AM", "Tue PM", "Wed AM", "Wed PM", "Thu AM", "Thu PM", "Fri AM", "Fri PM", "Sat AM", "Sat PM"];

// Base probabilities when no previous pattern is known
const BASE_RATES: Record<PatternName, number> = {
  "fluctuating": 0.346,
  "large-spike": 0.2476,
  "decreasing": 0.1584,
  "small-spike": 0.248,
};

// Transition probabilities: given previous pattern, probability of each next pattern
const TRANSITION: Record<PatternName, Record<PatternName, number>> = {
  "fluctuating": { "fluctuating": 0.20, "large-spike": 0.30, "decreasing": 0.15, "small-spike": 0.35 },
  "large-spike": { "fluctuating": 0.50, "large-spike": 0.05, "decreasing": 0.20, "small-spike": 0.25 },
  "decreasing": { "fluctuating": 0.25, "large-spike": 0.45, "decreasing": 0.05, "small-spike": 0.25 },
  "small-spike": { "fluctuating": 0.45, "large-spike": 0.25, "decreasing": 0.15, "small-spike": 0.15 },
};

function pct(base: number, lo: number, hi: number): PriceRange {
  return { min: Math.floor(base * lo), max: Math.ceil(base * hi) };
}

/**
 * Generate possible price ranges for each pattern given a buy price.
 * These are simplified but accurate bounds based on game code analysis.
 */
function generateFluctuating(buy: number): PriceRange[] {
  // Prices fluctuate between 60-140% of buy price with decreasing phases mixed in
  return DAY_LABELS.map(() => pct(buy, 0.6, 1.4));
}

function generateLargeSpike(buy: number): PriceRange[] {
  // Decreasing start, then spike to 200-600%, then crash
  const prices: PriceRange[] = [];
  for (let i = 0; i < 12; i++) {
    if (i < 3) {
      prices.push(pct(buy, 0.85, 0.9)); // Early decline
    } else if (i < 5) {
      prices.push(pct(buy, 0.9, 1.4)); // Pre-spike rise
    } else if (i < 7) {
      prices.push(pct(buy, 1.4, 6.0)); // THE SPIKE (200-600%)
    } else if (i < 9) {
      prices.push(pct(buy, 1.4, 2.0)); // Post-spike
    } else {
      prices.push(pct(buy, 0.4, 0.9)); // Crash
    }
  }
  return prices;
}

function generateDecreasing(buy: number): PriceRange[] {
  // Steadily decreases from ~85% down to ~40%
  return DAY_LABELS.map((_, i) => {
    const decay = i * 0.035;
    return pct(buy, Math.max(0.4, 0.85 - decay - 0.05), Math.max(0.4, 0.85 - decay + 0.02));
  });
}

function generateSmallSpike(buy: number): PriceRange[] {
  // Similar to fluctuating but with a moderate spike to 140-200%
  const prices: PriceRange[] = [];
  for (let i = 0; i < 12; i++) {
    if (i < 4) {
      prices.push(pct(buy, 0.4, 0.9));
    } else if (i < 7) {
      prices.push(pct(buy, 0.9, 1.4));
    } else if (i < 9) {
      prices.push(pct(buy, 1.4, 2.0)); // Small spike peak
    } else {
      prices.push(pct(buy, 0.4, 0.9));
    }
  }
  return prices;
}

const GENERATORS: Record<PatternName, (buy: number) => PriceRange[]> = {
  "fluctuating": generateFluctuating,
  "large-spike": generateLargeSpike,
  "decreasing": generateDecreasing,
  "small-spike": generateSmallSpike,
};

const PATTERN_LABELS: Record<PatternName, string> = {
  "fluctuating": "Fluctuating",
  "large-spike": "Large Spike",
  "decreasing": "Decreasing",
  "small-spike": "Small Spike",
};

/**
 * Check if actual prices are consistent with a pattern's predicted ranges.
 */
function isConsistent(actual: (number | null)[], predicted: PriceRange[]): boolean {
  for (let i = 0; i < 12; i++) {
    const price = actual[i];
    if (price != null) {
      // Allow some tolerance (game has randomness within ranges)
      if (price < predicted[i].min - 1 || price > predicted[i].max + 1) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Narrow predicted ranges based on actual entered prices.
 */
function narrowRanges(actual: (number | null)[], predicted: PriceRange[]): PriceRange[] {
  return predicted.map((range, i) => {
    const price = actual[i];
    if (price != null) {
      return { min: price, max: price };
    }
    return range;
  });
}

export function predictTurnips(
  buyPrice: number | null,
  prices: Array<{ am: number | null; pm: number | null }>,
  previousPattern: PatternName | null,
  isFirstTime: boolean
): TurnipPredictionResult {
  if (!buyPrice || buyPrice <= 0) {
    return { patterns: [], bestDay: null, worstCase: 0 };
  }

  // Flatten prices to 12-slot array
  const actual: (number | null)[] = prices.flatMap((d) => [d.am, d.pm]);

  // Determine prior probabilities
  const priors = previousPattern
    ? TRANSITION[previousPattern]
    : BASE_RATES;

  // First-time buyers cannot get decreasing pattern
  const adjustedPriors = { ...priors };
  if (isFirstTime) {
    adjustedPriors["decreasing"] = 0;
    const sum = Object.values(adjustedPriors).reduce((a, b) => a + b, 0);
    for (const key of Object.keys(adjustedPriors) as PatternName[]) {
      adjustedPriors[key] /= sum;
    }
  }

  // Generate and filter patterns
  const candidates: PatternPrediction[] = [];
  for (const pattern of Object.keys(GENERATORS) as PatternName[]) {
    const predicted = GENERATORS[pattern](buyPrice);
    if (isConsistent(actual, predicted)) {
      const narrowed = narrowRanges(actual, predicted);
      candidates.push({
        pattern,
        label: PATTERN_LABELS[pattern],
        probability: adjustedPriors[pattern],
        prices: narrowed,
        guaranteedMin: Math.min(...narrowed.map((r) => r.min)),
        potentialMax: Math.max(...narrowed.map((r) => r.max)),
      });
    }
  }

  // Normalize probabilities among remaining candidates
  const totalProb = candidates.reduce((sum, c) => sum + c.probability, 0);
  if (totalProb > 0) {
    for (const c of candidates) {
      c.probability = c.probability / totalProb;
    }
  }

  // Sort by probability descending
  candidates.sort((a, b) => b.probability - a.probability);

  // Find best selling opportunity across all patterns
  let bestDay: { index: number; label: string; max: number } | null = null;
  let worstCase = buyPrice;
  for (const c of candidates) {
    for (let i = 0; i < 12; i++) {
      if (actual[i] != null) continue; // Skip already-sold slots
      if (!bestDay || c.prices[i].max > bestDay.max) {
        bestDay = { index: i, label: DAY_LABELS[i], max: c.prices[i].max };
      }
    }
    worstCase = Math.min(worstCase, c.guaranteedMin);
  }

  return { patterns: candidates, bestDay, worstCase };
}

export { DAY_LABELS };
