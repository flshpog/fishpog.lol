// =============================================================================
// MeteoNook Data Tables & Algorithm Reimplementation in TypeScript
// Extracted from: https://github.com/Treeki/MeteoNook (MIT License)
// Source files: src/data.rs and src/lib.rs
// =============================================================================

// ========================== ENUMS ==========================

export enum Hemisphere {
  Northern = 0,
  Southern = 1,
}

/** Weather types: 0=Clear, 1=Sunny, 2=Cloudy, 3=RainClouds, 4=Rain, 5=HeavyRain */
export enum Weather {
  Clear = 0,
  Sunny = 1,
  Cloudy = 2,
  RainClouds = 3,
  Rain = 4,
  HeavyRain = 5,
}

export enum WindType {
  Calm = 0,
  Land0 = 1,
  Land1 = 2,
  Land2 = 3,
  Sea0 = 4,
  Sea1 = 5,
  Sea2 = 6,
}

export enum SpecialDay {
  None = 0,
  Easter = 1,
  FishCon = 2,
  InsectCon = 3,
  Countdown = 4,
  Fireworks = 5,
}

export enum SnowLevel {
  None = 0,
  Low = 1,
  Full = 2,
}

export enum CloudLevel {
  None = 0,
  Cumulonimbus = 1,
  Cirrus = 2,
  Thin = 3,
  Billow = 4,
}

export enum SpWeatherLevel {
  None = 0,
  Rainbow = 1,
  Aurora = 2,
}

export enum FogLevel {
  None = 0,
  HeavyAndWater = 1,
  WaterOnly = 2,
}

export enum Pattern {
  Fine00 = 0,
  Fine01 = 1,
  Fine02 = 2,
  Fine03 = 3,
  Fine04 = 4,
  Fine05 = 5,
  Fine06 = 6,
  Cloud00 = 7,
  Cloud01 = 8,
  Cloud02 = 9,
  Rain00 = 10,
  Rain01 = 11,
  Rain02 = 12,
  Rain03 = 13,
  Rain04 = 14,
  Rain05 = 15,
  FineCloud00 = 16,
  FineCloud01 = 17,
  FineCloud02 = 18,
  CloudFine00 = 19,
  CloudFine01 = 20,
  CloudFine02 = 21,
  FineRain00 = 22,
  FineRain01 = 23,
  FineRain02 = 24,
  FineRain03 = 25,
  CloudRain00 = 26,
  CloudRain01 = 27,
  CloudRain02 = 28,
  RainCloud00 = 29,
  RainCloud01 = 30,
  RainCloud02 = 31,
  Commun00 = 32,
  EventDay00 = 33,
}

export enum PatternKind {
  Fine = 0,
  Cloud = 1,
  Rain = 2,
  FineCloud = 3,
  CloudFine = 4,
  FineRain = 5,
  CloudRain = 6,
  RainCloud = 7,
  Commun = 8,
  EventDay = 9,
}

export enum Constellation {
  Capricorn = 0,
  Aquarius = 1,
  Pisces = 2,
  Aries = 3,
  Taurus = 4,
  Gemini = 5,
  Cancer = 6,
  Leo = 7,
  Virgo = 8,
  Libra = 9,
  Scorpio = 10,
  Sagittarius = 11,
}

// ========================== SPECIAL DAY TABLES ==========================
// All arrays are indexed by (year - 2000), valid for years 2000-2060 (61 entries)

/** Easter day-of-month for years 2000-2060. Note: only year 2020 is checked in the original code. */
export const EASTER_DAYS: readonly number[] = [23,15,31,20,11,27,16,8,23,12,4,24,8,31,20,5,27,16,1,21,12,4,17,9,31,20,5,28,16,1,21,13,28,17,9,25,13,5,25,10,1,21,6,29,17,9,25,14,5,18,10,2,21,6,29,18,2,22,14,30,18];

/** Easter month for years 2000-2060. */
export const EASTER_MONTHS: readonly number[] = [4,4,3,4,4,3,4,4,3,4,4,4,4,3,4,4,3,4,4,4,4,4,4,4,3,4,4,3,4,4,4,4,3,4,4,3,4,4,4,4,4,4,4,3,4,4,3,4,4,4,4,4,4,4,3,4,4,4,4,3,4];

/** First Sunday in August for years 2000-2060 (for Fireworks). */
export const AUGUST_SUNDAYS: readonly number[] = [6,5,4,3,1,7,6,5,3,2,1,7,5,4,3,2,7,6,5,4,2,1,7,6,4,3,2,1,6,5,4,3,1,7,6,5,3,2,1,7,5,4,3,2,7,6,5,4,2,1,7,6,4,3,2,1,6,5,4,3,1];

/** Fishing Tourney dates: 2nd Saturday of January */
export const FISH_CON_JAN: readonly number[] = [8,13,12,11,10,8,14,13,12,10,9,8,14,12,11,10,9,14,13,12,11,9,8,14,13,11,10,9,8,13,12,11,10,8,14,13,12,10,9,8,14,12,11,10,9,14,13,12,11,9,8,14,13,11,10,9,8,13,12,11,10];

/** Fishing Tourney dates: 2nd Saturday of April */
export const FISH_CON_APR: readonly number[] = [8,14,13,12,10,9,8,14,12,11,10,9,14,13,12,11,9,8,14,13,11,10,9,8,13,12,11,10,8,14,13,12,10,9,8,14,12,11,10,9,14,13,12,11,9,8,14,13,11,10,9,8,13,12,11,10,8,14,13,12,10];

/** Fishing Tourney dates: 2nd Saturday of July */
export const FISH_CON_JUL: readonly number[] = [8,14,13,12,10,9,8,14,12,11,10,9,14,13,12,11,9,8,14,13,11,10,9,8,13,12,11,10,8,14,13,12,10,9,8,14,12,11,10,9,14,13,12,11,9,8,14,13,11,10,9,8,13,12,11,10,8,14,13,12,10];

/** Fishing Tourney dates: 2nd Saturday of October */
export const FISH_CON_OCT: readonly number[] = [14,13,12,11,9,8,14,13,11,10,9,8,13,12,11,10,8,14,13,12,10,9,8,14,12,11,10,9,14,13,12,11,9,8,14,13,11,10,9,8,13,12,11,10,8,14,13,12,10,9,8,14,12,11,10,9,14,13,12,11,9];

/** Bug-Off: 4th Saturday of June (Northern) */
export const INSECT_CON_JUN_N: readonly number[] = [24,23,22,28,26,25,24,23,28,27,26,25,23,22,28,27,25,24,23,22,27,26,25,24,22,28,27,26,24,23,22,28,26,25,24,23,28,27,26,25,23,22,28,27,25,24,23,22,27,26,25,24,22,28,27,26,24,23,22,28,26];

/** Bug-Off: 4th Saturday of July (Northern) */
export const INSECT_CON_JUL_N: readonly number[] = [22,28,27,26,24,23,22,28,26,25,24,23,28,27,26,25,23,22,28,27,25,24,23,22,27,26,25,24,22,28,27,26,24,23,22,28,26,25,24,23,28,27,26,25,23,22,28,27,25,24,23,22,27,26,25,24,22,28,27,26,24];

/** Bug-Off: 4th Saturday of August (Northern) */
export const INSECT_CON_AUG_N: readonly number[] = [26,25,24,23,28,27,26,25,23,22,28,27,25,24,23,22,27,26,25,24,22,28,27,26,24,23,22,28,26,25,24,23,28,27,26,25,23,22,28,27,25,24,23,22,27,26,25,24,22,28,27,26,24,23,22,28,26,25,24,23,28];

/** Bug-Off: 4th Saturday of September (Northern) */
export const INSECT_CON_SEP_N: readonly number[] = [23,22,28,27,25,24,23,22,27,26,25,24,22,28,27,26,24,23,22,28,26,25,24,23,28,27,26,25,23,22,28,27,25,24,23,22,27,26,25,24,22,28,27,26,24,23,22,28,26,25,24,23,28,27,26,25,23,22,28,27,25];

/** Bug-Off: 3rd Saturday of January (Southern) */
export const INSECT_CON_JAN_S: readonly number[] = [15,20,19,18,17,15,21,20,19,17,16,15,21,19,18,17,16,21,20,19,18,16,15,21,20,18,17,16,15,20,19,18,17,15,21,20,19,17,16,15,21,19,18,17,16,21,20,19,18,16,15,21,20,18,17,16,15,20,19,18,17];

/** Bug-Off: 3rd Saturday of February (Southern) */
export const INSECT_CON_FEB_S: readonly number[] = [19,17,16,15,21,19,18,17,16,21,20,19,18,16,15,21,20,18,17,16,15,20,19,18,17,15,21,20,19,17,16,15,21,19,18,17,16,21,20,19,18,16,15,21,20,18,17,16,15,20,19,18,17,15,21,20,19,17,16,15,21];

/** Bug-Off: 3rd Saturday of November (Southern) */
export const INSECT_CON_NOV_S: readonly number[] = [18,17,16,15,20,19,18,17,15,21,20,19,17,16,15,21,19,18,17,16,21,20,19,18,16,15,21,20,18,17,16,15,20,19,18,17,15,21,20,19,17,16,15,21,19,18,17,16,21,20,19,18,16,15,21,20,18,17,16,15,20];

/** Bug-Off: 3rd Saturday of December (Southern) */
export const INSECT_CON_DEC_S: readonly number[] = [16,15,21,20,18,17,16,15,20,19,18,17,15,21,20,19,17,16,15,21,19,18,17,16,21,20,19,18,16,15,21,20,18,17,16,15,20,19,18,17,15,21,20,19,17,16,15,21,19,18,17,16,21,20,19,18,16,15,21,20,18];

// ========================== RATE_LOOKUP_N ==========================
// Northern hemisphere: [month 0-11][day 0-30] -> rate set index (into RATE_MAPS)

export const RATE_LOOKUP_N: readonly (readonly number[])[] = [
  [0,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,4,4,4,4,4,4,4],
  [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
  [5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
  [7,7,7,7,7,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8],
  [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9],
  [10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,12],
  [12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12],
  [12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,13,13,13,13,13,13,13,13,13,14,15,15,15,15,15,15],
  [15,15,15,15,15,15,15,15,15,16,17,17,17,17,17,17,17,17,17,17,17,17,17,18,18,18,18,18,18,18,19],
];

// ========================== RATE_LOOKUP_S ==========================
// Southern hemisphere: [month 0-11][day 0-30] -> rate set index (into RATE_MAPS)

export const RATE_LOOKUP_S: readonly (readonly number[])[] = [
  [20,21,21,21,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22],
  [23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,24,24],
  [24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25],
  [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
  [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,27,27,27,27,27,27,27,27,27,28,29,29,29,29,29,29],
  [29,29,29,29,29,29,29,29,29,30,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,32],
  [32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],
  [32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,33,34,34,34,34,34,34,34],
  [34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,35],
  [35,35,35,35,35,35,35,35,35,35,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36],
  [36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36],
  [36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,37,37,37,37,37,37,37,37,38,38,38,38,38,38,38,39],
];

// ========================== RATE_MAPS ==========================
// 40 rate sets, each 100 entries. Given a random roll 0-99, maps to a Pattern index.

export const RATE_MAPS: readonly (readonly number[])[] = [
  [0,0,0,0,0,0,0,0,0,0,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33],
  [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [0,0,0,0,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,7,8,9,10,10,10,11,11,11,12,12,12,13,13,13,14,14,14,15,15,15,16,16,17,17,18,18,19,19,20,20,21,21,26,26,27,27,28,28,29,29,30,30,31,31],
  [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,19,19,19,19,19,19,19,19,19,19,20,20,20,20,20,20,20,20,20,20,21,21,21,21,21,21,21,21,21,21],
  [0,0,0,0,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,7,7,7,8,8,8,9,9,9,10,10,11,11,12,12,16,16,17,17,18,18,19,19,20,20,21,21,26,26,26,27,27,27,28,28,28,29,29,30,30,31,31],
  [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [0,0,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,7,7,7,7,8,8,8,8,9,9,9,9,10,10,10,11,11,11,12,12,12,13,13,16,16,17,17,18,18,19,19,20,20,21,21,26,26,27,27,28,28,29,29,30,30,31,31],
  [0,0,2,2,2,2,2,2,2,2,4,4,4,4,4,4,4,4,6,6,6,6,6,6,6,6,7,7,7,8,8,8,9,9,9,9,9,10,10,10,10,10,10,10,10,10,10,11,11,11,11,11,11,11,11,11,11,12,12,12,12,12,12,12,12,12,12,13,13,13,14,14,14,15,15,15,16,17,18,19,20,21,26,26,26,27,27,27,28,28,28,29,29,29,30,30,30,31,31,31],
  [0,0,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,7,8,9,9,10,11,12,13,14,15,16,16,17,17,18,18,19,19,20,20,21,21,22,22,22,22,22,23,23,23,23,23,24,24,24,25,25,25],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,7,8,9,19,19,20,20,21,21,22,22,22,23,23,23,24,24,24,24,24,24,24,24,24,24,25,25,25,25,25,25,25,25,25,25],
  [0,0,0,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,10,10,11,11,12,12,13,13,13,14,14,14,15,15,15,22,22,22,22,22,22,22,22,23,23,23,23,23,23,23,23,24,24,24,24,24,24,25,25,25,25,25,25,26,27,28,29,30,31],
  [0,0,0,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,7,7,8,8,9,10,10,11,11,12,12,13,13,14,14,15,15,16,17,18,19,19,20,20,21,21,22,22,22,22,23,23,23,23,26,27,28,29,30,31],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,14,15,16,16,17,17,17,17,18,18,18,18,19,19,20,20,21,21,22,22,22,23,23,23],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,7,7,7,7,7,7,7,8,8,8,8,8,8,8],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,7,7,7,7,8,8,8,8],
  [0,0,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,7,7,7,8,8,8,9,9,9,10,10,10,11,11,11,12,12,12,16,16,17,17,18,18,19,19,20,20,21,21,26,26,27,27,28,28,29,29,30,30,31,31],
  [13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],
  [0,0,0,0,1,1,1,2,2,2,2,2,2,2,2,2,3,3,3,4,4,4,4,4,4,4,4,4,5,5,5,6,6,6,6,6,6,6,6,6,7,7,8,8,9,9,10,10,10,10,10,11,11,11,11,11,12,12,12,12,12,13,13,13,14,14,14,15,15,15,16,16,17,17,18,18,19,19,20,20,21,21,26,26,26,27,27,27,28,28,28,29,29,29,30,30,30,31,31,31],
  [10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,13,13,13,13,13,13,13,13,13,13,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],
  [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6],
  // --- Southern hemisphere rate sets start here (index 20-39) ---
  [0,0,0,0,0,0,0,0,0,0,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33],
  [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [0,0,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,7,8,9,9,10,11,12,13,14,15,16,16,17,17,18,18,19,19,20,20,21,21,22,22,22,22,22,23,23,23,23,23,24,24,24,25,25,25],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,7,8,9,10,11,12,13,14,15,16,17,19,19,20,20,21,21,22,22,22,22,23,23,23,23,24,24,24,24,24,25,25,25,25,25],
  [0,0,0,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,13,14,14,14,15,15,15,16,17,18,19,20,21,22,22,22,22,23,23,23,23,24,24,24,24,25,25,25,25,26,27,28,29,30,31],
  [0,0,0,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,7,7,8,8,9,10,10,11,11,12,12,13,13,14,14,15,15,16,17,18,19,19,20,20,21,21,22,22,22,22,23,23,23,23,26,27,28,29,30,31],
  [0,0,0,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,7,7,7,8,8,8,9,9,9,10,10,11,11,12,12,13,14,15,16,16,17,17,18,18,19,19,20,20,21,21,22,22,22,23,23,23,26,27,29,30],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,7,7,7,8,8,8,16,16,17,17,18,18,19,19,20,20,21,21],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,19,19,19,19,19,19,19,19,19,19,20,20,20,20,20,20,20,20,20,20,21,21,21,21,21,21,21,21,21,21],
  [0,0,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,7,7,7,8,8,8,9,9,9,10,10,10,11,11,11,12,12,12,16,16,17,17,18,18,19,19,20,20,21,21,26,26,27,27,28,28,29,29,30,30,31,31],
  [13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],
  [0,0,0,0,1,1,1,2,2,2,2,2,2,2,2,2,3,3,3,4,4,4,4,4,4,4,4,4,5,5,5,6,6,6,6,6,6,6,6,6,7,7,8,8,9,9,10,10,10,10,10,11,11,11,11,11,12,12,12,12,12,13,13,13,14,14,14,15,15,15,16,16,17,17,18,18,19,19,20,20,21,21,26,26,26,27,27,27,28,28,28,29,29,29,30,30,30,31,31,31],
  [0,0,0,0,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,7,8,9,10,10,10,11,11,11,12,12,12,13,13,13,14,14,14,15,15,15,16,16,17,17,18,18,19,19,20,20,21,21,26,26,27,27,28,28,29,29,30,30,31,31],
  [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,19,19,19,19,19,19,19,19,19,19,20,20,20,20,20,20,20,20,20,20,21,21,21,21,21,21,21,21,21,21],
  [0,0,0,0,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,7,7,7,8,8,8,9,9,9,10,10,11,11,12,12,16,16,17,17,18,18,19,19,20,20,21,21,26,26,26,27,27,27,28,28,28,29,29,30,30,31,31],
  [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [0,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,7,7,7,7,7,7,8,8,8,8,8,8,9,9,9,9,9,9,10,10,10,11,11,11,12,12,12,26,26,27,27,28,28,29,29,30,30,31,31],
  [0,0,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,7,7,7,7,8,8,8,8,9,9,9,9,10,10,10,11,11,11,12,12,12,13,13,16,16,17,17,18,18,19,19,20,20,21,21,26,26,27,27,28,28,29,29,30,30,31,31],
  [0,0,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,7,7,7,7,8,8,8,8,9,9,9,9,10,10,10,11,11,11,12,12,12,13,13,16,16,17,17,18,18,19,19,20,20,21,21,26,26,27,27,28,28,29,29,30,30,31,31],
  [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6],
];

// ========================== PATTERNS ==========================
// 34 patterns x 24 hours. Values are Weather enum values (0-5).
// Index: PATTERNS[patternIndex][hour]
// F=Clear(0), C=Sunny(1), O=Cloudy(2), RC=RainClouds(3), R=Rain(4), HR=HeavyRain(5)

export const PATTERNS: readonly (readonly Weather[])[] = [
  //                    0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23
  /* Fine00       */ [0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0],
  /* Fine01       */ [0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 2, 0, 1, 0, 1, 1, 2, 1, 2, 1, 0, 1],
  /* Fine02       */ [0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 2, 0, 1, 0, 1, 1, 0, 1, 2, 1, 1, 1, 0, 0],
  /* Fine03       */ [0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 2, 1, 0, 1, 1, 1, 0, 2, 0, 0, 1],
  /* Fine04       */ [0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 2, 1, 0, 1, 0, 1, 1, 0, 1, 0],
  /* Fine05       */ [2, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 2, 1, 1, 0, 1, 2, 1, 1, 0, 1],
  /* Fine06       */ [0, 1, 0, 1, 1, 1, 2, 1, 1, 2, 0, 1, 0, 1, 1, 0, 1, 2, 2, 1, 1, 1, 0, 0],
  /* Cloud00      */ [1, 1, 1, 2, 2, 2, 3, 2, 2, 2, 1, 1, 2, 2, 2, 1, 1, 2, 2, 2, 3, 2, 2, 1],
  /* Cloud01      */ [1, 2, 3, 2, 2, 2, 2, 2, 1, 2, 3, 2, 2, 1, 2, 2, 2, 3, 3, 2, 2, 1, 1, 1],
  /* Cloud02      */ [2, 2, 2, 3, 2, 2, 2, 3, 4, 4, 4, 2, 2, 3, 4, 4, 4, 2, 2, 3, 2, 3, 2, 2],
  /* Rain00       */ [1, 2, 3, 4, 4, 4, 4, 3, 2, 1, 3, 4, 4, 4, 4, 4, 4, 2, 2, 3, 4, 4, 4, 2],
  /* Rain01       */ [3, 4, 4, 4, 4, 4, 4, 4, 4, 2, 3, 4, 4, 2, 2, 3, 5, 4, 4, 4, 4, 1, 1, 2],
  /* Rain02       */ [3, 2, 4, 4, 4, 4, 4, 4, 3, 4, 1, 3, 4, 4, 4, 2, 4, 4, 4, 3, 5, 4, 4, 4],
  /* Rain03       */ [4, 4, 4, 4, 4, 4, 3, 4, 4, 5, 5, 4, 4, 5, 5, 5, 5, 4, 4, 4, 4, 4, 2, 3],
  /* Rain04       */ [4, 4, 5, 5, 4, 4, 4, 5, 5, 5, 5, 4, 5, 5, 5, 4, 4, 5, 5, 5, 5, 5, 5, 4],
  /* Rain05       */ [3, 4, 4, 5, 4, 5, 5, 4, 4, 5, 5, 5, 5, 4, 5, 5, 5, 5, 5, 5, 4, 4, 2, 1],
  /* FineCloud00  */ [3, 2, 3, 3, 2, 4, 2, 2, 2, 2, 2, 1, 1, 0, 1, 1, 0, 1, 1, 1, 2, 2, 2, 2],
  /* FineCloud01  */ [2, 3, 2, 2, 2, 2, 1, 1, 1, 0, 1, 1, 0, 1, 1, 2, 3, 4, 4, 2, 2, 3, 2, 2],
  /* FineCloud02  */ [4, 4, 2, 2, 2, 2, 0, 1, 0, 1, 1, 2, 2, 1, 2, 2, 2, 2, 2, 3, 2, 3, 3, 4],
  /* CloudFine00  */ [0, 1, 1, 1, 1, 3, 4, 4, 2, 4, 1, 2, 1, 2, 2, 1, 1, 0, 1, 1, 1, 1, 0, 0],
  /* CloudFine01  */ [1, 0, 0, 1, 1, 1, 4, 2, 2, 2, 2, 3, 4, 1, 1, 2, 1, 1, 0, 1, 1, 0, 1, 1],
  /* CloudFine02  */ [1, 1, 1, 1, 1, 0, 2, 3, 4, 2, 3, 4, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0],
  /* FineRain00   */ [0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 4, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1],
  /* FineRain01   */ [0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 4, 2, 4, 1, 1, 1, 0, 1, 1, 1, 1, 1],
  /* FineRain02   */ [1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 5, 2, 1, 0, 1, 1, 0, 1, 0],
  /* FineRain03   */ [0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 5, 4, 1, 1, 1, 0, 1, 1, 0, 1],
  /* CloudRain00  */ [4, 4, 4, 4, 4, 4, 2, 2, 1, 2, 2, 3, 4, 4, 4, 5, 5, 4, 4, 4, 4, 4, 4, 4],
  /* CloudRain01  */ [4, 4, 4, 4, 2, 2, 1, 1, 2, 2, 4, 4, 4, 2, 2, 3, 4, 4, 4, 4, 4, 2, 4, 4],
  /* CloudRain02  */ [5, 5, 4, 5, 4, 4, 2, 2, 2, 1, 1, 2, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3],
  /* RainCloud00  */ [2, 3, 2, 2, 2, 2, 4, 4, 2, 2, 3, 4, 4, 2, 3, 2, 1, 1, 2, 2, 2, 2, 2, 2],
  /* RainCloud01  */ [2, 2, 2, 2, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 3, 2, 2, 2, 2, 2, 1, 1],
  /* RainCloud02  */ [1, 1, 2, 2, 3, 3, 5, 5, 4, 4, 4, 2, 2, 4, 2, 2, 2, 2, 2, 3, 2, 3, 2, 2],
  /* Commun00     */ [0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 2, 0, 1, 0, 1, 1, 2, 1, 2, 1, 0, 1],
  /* EventDay00   */ [0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1],
];

// ========================== WINDS ==========================
// 34 patterns x 24 hours. Values are WindType enum values (0-6).

export const WINDS: readonly (readonly WindType[])[] = [
  /* Fine00       */ [1,2,2,3,3,1,1,0,4,4,4,5,4,5,6,6,5,4,0,1,1,1,2,1],
  /* Fine01       */ [2,1,2,2,2,2,1,0,4,4,4,5,6,4,5,6,5,4,4,0,1,1,1,1],
  /* Fine02       */ [2,1,2,3,2,1,0,4,4,5,4,4,5,6,5,5,4,4,4,0,1,1,2,3],
  /* Fine03       */ [2,3,2,2,3,2,1,0,4,4,5,4,4,5,5,6,5,4,0,1,1,1,2,1],
  /* Fine04       */ [3,2,1,2,3,2,1,1,0,4,4,5,4,5,5,6,4,4,0,1,1,1,2,2],
  /* Fine05       */ [1,2,3,2,2,2,1,0,4,4,5,6,5,4,5,6,5,4,0,1,1,1,1,2],
  /* Fine06       */ [1,2,2,3,3,2,1,0,4,4,5,4,4,5,6,6,5,4,0,1,1,2,2,1],
  /* Cloud00      */ [2,1,2,3,3,2,2,1,0,4,4,5,4,5,5,4,5,4,0,1,1,2,1,1],
  /* Cloud01      */ [2,3,3,2,3,1,1,0,4,4,5,4,4,5,5,4,4,4,4,0,1,1,1,2],
  /* Cloud02      */ [2,2,3,3,2,2,0,4,4,5,5,5,4,4,4,5,5,4,0,1,1,2,1,1],
  /* Rain00       */ [3,2,1,2,3,1,0,4,4,5,4,5,5,6,5,4,5,5,4,0,1,1,2,2],
  /* Rain01       */ [1,2,2,3,3,2,0,4,4,5,5,6,5,6,5,4,5,4,4,0,1,2,2,1],
  /* Rain02       */ [3,2,1,2,3,3,1,0,4,5,6,6,5,6,5,6,5,4,0,1,2,2,1,2],
  /* Rain03       */ [2,3,2,1,2,2,0,4,4,5,5,6,5,5,6,6,5,4,5,0,1,2,2,1],
  /* Rain04       */ [2,1,1,2,2,3,2,0,5,4,5,4,5,6,5,6,5,4,0,2,2,3,2,3],
  /* Rain05       */ [1,1,2,3,2,1,0,4,5,6,5,5,4,5,6,5,4,5,4,0,1,2,3,2],
  /* FineCloud00  */ [1,3,2,2,3,1,0,4,4,4,5,4,5,6,5,6,5,4,0,1,1,1,2,2],
  /* FineCloud01  */ [3,2,3,2,2,2,1,0,4,4,5,5,6,5,4,6,5,4,4,0,1,2,2,1],
  /* FineCloud02  */ [2,1,3,2,3,1,1,0,4,4,5,4,4,5,6,6,5,4,0,1,1,2,2,3],
  /* CloudFine00  */ [2,3,3,2,3,2,1,0,4,4,5,4,5,4,5,6,5,4,4,0,1,1,1,2],
  /* CloudFine01  */ [1,1,2,2,3,1,0,4,4,5,4,4,5,5,6,5,4,4,0,1,1,2,2,1],
  /* CloudFine02  */ [2,1,2,3,2,2,1,0,4,4,5,4,5,6,5,6,5,4,0,1,1,1,2,3],
  /* FineRain00   */ [3,2,1,2,3,2,1,0,4,4,5,4,5,6,5,6,5,4,4,0,1,1,2,2],
  /* FineRain01   */ [1,2,3,1,3,2,1,0,4,4,5,4,5,6,6,5,5,4,0,1,1,2,1,1],
  /* FineRain02   */ [2,3,2,2,3,2,1,0,4,4,4,5,5,6,5,6,5,4,4,0,1,1,1,2],
  /* FineRain03   */ [1,2,3,3,3,2,1,1,0,4,4,4,5,5,5,6,5,4,0,1,1,2,1,1],
  /* CloudRain00  */ [2,1,1,2,3,2,0,4,4,4,5,6,5,5,6,5,5,4,0,1,1,1,2,3],
  /* CloudRain01  */ [2,3,2,3,2,2,1,0,4,4,4,4,5,6,5,6,5,4,0,1,1,2,1,2],
  /* CloudRain02  */ [3,2,1,2,3,2,1,0,4,4,5,4,4,5,5,6,5,4,0,1,1,2,2,3],
  /* RainCloud00  */ [3,2,1,2,3,2,0,4,4,4,5,4,4,5,5,6,5,4,0,1,1,2,1,2],
  /* RainCloud01  */ [2,3,2,3,3,2,1,0,4,4,4,5,4,5,6,5,5,4,0,1,1,1,2,2],
  /* RainCloud02  */ [2,1,2,1,3,4,0,4,4,4,5,4,5,6,6,5,5,4,0,1,1,1,2,3],
  /* Commun00     */ [2,1,2,2,2,2,1,0,4,4,4,5,6,4,5,6,5,4,4,0,1,1,1,1],
  /* EventDay00   */ [2,1,2,2,2,2,1,0,4,4,4,5,6,4,5,6,5,4,4,0,1,1,1,1],
];

// ========================== PRNG IMPLEMENTATION ==========================

/**
 * MeteoNook PRNG - implements the same Mersenne-style PRNG as Animal Crossing: New Horizons.
 * Uses 32-bit unsigned wrapping arithmetic throughout.
 */
export class Random {
  private a: number;
  private b: number;
  private c: number;
  private d: number;

  constructor() {
    this.a = 0;
    this.b = 0;
    this.c = 0;
    this.d = 0;
  }

  /** Create from explicit 4-word state */
  static withState(a: number, b: number, c: number, d: number): Random {
    const r = new Random();
    r.a = a >>> 0;
    r.b = b >>> 0;
    r.c = c >>> 0;
    r.d = d >>> 0;
    return r;
  }

  /** Create from a single seed value */
  static withSeed(seed: number): Random {
    const r = new Random();
    r.init(seed);
    return r;
  }

  /**
   * Initialize state from seed.
   * Multiplier: 0x6C078965
   * Each state word = (prev ^ (prev >>> 30)) * mult + index
   */
  init(seed: number): void {
    seed = seed >>> 0;
    const mult = 0x6C078965;
    this.a = (Math.imul((seed ^ (seed >>> 30)) >>> 0, mult) + 1) >>> 0;
    this.b = (Math.imul((this.a ^ (this.a >>> 30)) >>> 0, mult) + 2) >>> 0;
    this.c = (Math.imul((this.b ^ (this.b >>> 30)) >>> 0, mult) + 3) >>> 0;
    this.d = (Math.imul((this.c ^ (this.c >>> 30)) >>> 0, mult) + 4) >>> 0;
  }

  /** Generate next 32-bit pseudorandom number */
  roll(): number {
    const n = (this.a ^ (this.a << 11)) >>> 0;
    this.a = this.b;
    this.b = this.c;
    this.c = this.d;
    this.d = (n ^ (n >>> 8) ^ this.d ^ (this.d >>> 19)) >>> 0;
    return this.d;
  }

  /**
   * Generate a random number in [0, limit).
   * Computes upper 32 bits of (roll * limit) without BigInt for performance.
   */
  rollMax(limit: number): number {
    const val = this.roll();
    const ah = (val >>> 16);
    const al = val & 0xFFFF;
    const bh = (limit >>> 16);
    const bl = limit & 0xFFFF;
    const t = al * bl;
    const mid1 = al * bh + ((t >>> 16) & 0xFFFF);
    const mid2 = ah * bl + (mid1 & 0xFFFF);
    return ((ah * bh + (mid1 >>> 16) + (mid2 >>> 16)) >>> 0);
  }

  /** Same as rollMax but for u8-sized limits */
  rollMax8(limit: number): number {
    return this.rollMax(limit);
  }
}

// ========================== SEED COMPUTATION ==========================

/**
 * Compute a seed from base + year/month/day multipliers.
 * Formula: (base | 0x80000000) + year_mult*year + month_mult*month + day_mult*day
 * All arithmetic is wrapping u32.
 */
export function computeSeedYMD(
  base: number,
  yearMult: number,
  monthMult: number,
  dayMult: number,
  year: number,
  month: number,
  day: number
): number {
  const y = Math.imul(yearMult, year) >>> 0;
  const m = Math.imul(monthMult, month) >>> 0;
  const d = Math.imul(dayMult, day) >>> 0;
  return ((base | 0x80000000) + y + m + d) >>> 0;
}

/**
 * Compute a seed from base + year/month/day/hour multipliers.
 */
export function computeSeedYMDH(
  base: number,
  yearMult: number,
  monthMult: number,
  dayMult: number,
  hourMult: number,
  year: number,
  month: number,
  day: number,
  hour: number
): number {
  const seed = computeSeedYMD(base, yearMult, monthMult, dayMult, year, month, day);
  const h = Math.imul(hourMult, hour) >>> 0;
  return (seed + h) >>> 0;
}

// ========================== SEED CONSTANTS SUMMARY ==========================
//
// These are the multipliers used in various compute_seed calls:
//
// get_pattern (daily weather pattern):
//   yearMult  = 0x2000000
//   monthMult = 0x200000
//   dayMult   = 0x10000
//
// get_rainbow_info / special clouds:
//   yearMult  = 0x1000000
//   monthMult = 0x40000
//   dayMult   = 0x1000
//
// get_wind_power:
//   yearMult  = 0x2000000
//   monthMult = 0x200000
//   dayMult   = 0x10000
//   hourMult  = 1
//
// query_stars (shooting stars):
//   yearMult  = 0x20000
//   monthMult = 0x2000
//   dayMult   = 0x100
//   hourMult  = 0x10000
//   (minute is added as minute * 0x100 to the hour seed)
//
// check_water_fog: uses special state init, not computeSeedYMD
//   state = (year<<8, month<<8, day<<8, seed|0x80000000)
//
// ========================== CORE FUNCTIONS ==========================

/** Convert a "linear hour" (0=7pm, 1=8pm, ... 8=3am) to a real hour */
export function fromLinearHour(linearHour: number): number {
  if (linearHour < 5) {
    return 19 + linearHour;
  } else {
    return linearHour - 5;
  }
}

/** Convert a real hour to a "linear hour" */
export function toLinearHour(hour: number): number {
  if (hour >= 19) {
    return hour - 19;
  } else {
    return hour + 5;
  }
}

const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function getMonthLength(year: number, month: number): number {
  const leap = (year & 3) === 0;
  if (leap && month === 2) {
    return 29;
  }
  return MONTH_LENGTHS[month - 1];
}

export function getNextDay(year: number, month: number, day: number): [number, number, number] {
  day += 1;
  if (day > getMonthLength(year, month)) {
    month += 1;
    day = 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return [year, month, day];
}

/** For hours 0-4 (midnight-4am), the "weather day" is actually the next calendar day */
export function normaliseLateYMD(year: number, month: number, day: number, hour: number): [number, number, number] {
  if (hour < 5) {
    return getNextDay(year, month, day);
  }
  return [year, month, day];
}

/** Get pattern kind from pattern index */
export function getPatternKind(pattern: Pattern): PatternKind {
  if (pattern <= 6) return PatternKind.Fine;
  if (pattern <= 9) return PatternKind.Cloud;
  if (pattern <= 15) return PatternKind.Rain;
  if (pattern <= 18) return PatternKind.FineCloud;
  if (pattern <= 21) return PatternKind.CloudFine;
  if (pattern <= 25) return PatternKind.FineRain;
  if (pattern <= 28) return PatternKind.CloudRain;
  if (pattern <= 31) return PatternKind.RainCloud;
  if (pattern === 32) return PatternKind.Commun;
  return PatternKind.EventDay; // 33
}

// ========================== SPECIAL DAY DETECTION ==========================

export function isSpecialDay(hemi: Hemisphere, y: number, m: number, d: number): SpecialDay {
  if (y >= 2000 && y <= 2060) {
    const idx = y - 2000;
    // Easter (only checked for 2020 in original code)
    if (y === 2020 && m === EASTER_MONTHS[idx] && d === EASTER_DAYS[idx]) {
      return SpecialDay.Easter;
    }
    // Fishing Tourney: 2nd Saturday of Jan, Apr, Jul, Oct
    if (m === 1 && d === FISH_CON_JAN[idx]) return SpecialDay.FishCon;
    if (m === 4 && d === FISH_CON_APR[idx]) return SpecialDay.FishCon;
    if (m === 7 && d === FISH_CON_JUL[idx]) return SpecialDay.FishCon;
    if (m === 10 && d === FISH_CON_OCT[idx]) return SpecialDay.FishCon;
    // Bug-Off
    if (hemi === Hemisphere.Northern) {
      if (m === 6 && d === INSECT_CON_JUN_N[idx]) return SpecialDay.InsectCon;
      if (m === 7 && d === INSECT_CON_JUL_N[idx]) return SpecialDay.InsectCon;
      if (m === 8 && d === INSECT_CON_AUG_N[idx]) return SpecialDay.InsectCon;
      if (m === 9 && d === INSECT_CON_SEP_N[idx]) return SpecialDay.InsectCon;
    } else {
      if (m === 1 && d === INSECT_CON_JAN_S[idx]) return SpecialDay.InsectCon;
      if (m === 2 && d === INSECT_CON_FEB_S[idx]) return SpecialDay.InsectCon;
      if (m === 11 && d === INSECT_CON_NOV_S[idx]) return SpecialDay.InsectCon;
      if (m === 12 && d === INSECT_CON_DEC_S[idx]) return SpecialDay.InsectCon;
    }
    // Fireworks: every Sunday in August
    if (m === 8 && (((d - 1) % 7) + 1) === AUGUST_SUNDAYS[idx]) return SpecialDay.Fireworks;
  }
  // Countdown: always Dec 31
  if (m === 12 && d === 31) return SpecialDay.Countdown;
  return SpecialDay.None;
}

// ========================== GET PATTERN ==========================

/**
 * Determine the weather pattern for a given seed, hemisphere, and date.
 *
 * Algorithm:
 *   1. If special day, return EventDay00
 *   2. Compute day seed: (seed | 0x80000000) + 0x2000000*year + 0x200000*month + 0x10000*day
 *   3. Init PRNG from day seed
 *   4. Roll twice (discard)
 *   5. Look up rate set from RATE_LOOKUP_N or RATE_LOOKUP_S
 *   6. Roll 0-99, index into RATE_MAPS[rateSet] to get pattern
 */
export function getPattern(hemi: Hemisphere, seed: number, year: number, month: number, day: number): Pattern {
  if (isSpecialDay(hemi, year, month, day) !== SpecialDay.None) {
    return Pattern.EventDay00;
  }

  const daySeed = computeSeedYMD(seed, 0x2000000, 0x200000, 0x10000, year, month, day);
  const rng = Random.withSeed(daySeed);
  rng.roll();
  rng.roll();
  const rateSet = hemi === Hemisphere.Northern
    ? RATE_LOOKUP_N[month - 1][day - 1]
    : RATE_LOOKUP_S[month - 1][day - 1];
  return RATE_MAPS[rateSet][rng.rollMax(100)] as Pattern;
}

/** Get the Weather enum for a given hour and pattern */
export function getWeather(hour: number, pattern: Pattern): Weather {
  return PATTERNS[pattern][hour];
}

/** Heavy shower pattern = Fine00 */
export function isHeavyShowerPattern(pattern: Pattern): boolean {
  return pattern === Pattern.Fine00;
}

/** Light shower patterns = Fine02, Fine04, Fine06 */
export function isLightShowerPattern(pattern: Pattern): boolean {
  return pattern === Pattern.Fine02 || pattern === Pattern.Fine04 || pattern === Pattern.Fine06;
}

/** Shooting stars can occur hours 19-23 and 0-3, only on Fine00/02/04/06 */
export function canHaveShootingStars(hour: number, pattern: Pattern): boolean {
  if (hour >= 19 || hour < 4) {
    return pattern === Pattern.Fine00 || pattern === Pattern.Fine02 ||
           pattern === Pattern.Fine04 || pattern === Pattern.Fine06;
  }
  return false;
}

// ========================== SHOOTING STARS ==========================

export interface StarResult {
  count: number;
  /** Bitmask of seconds (0-59) when stars appear */
  secondField: bigint;
}

/**
 * Query shooting stars for a specific minute.
 * Returns null if no stars, otherwise { count, secondField }.
 */
export function queryStarsInternal(seedBase: number, minute: number, pattern: Pattern): StarResult | null {
  const rng = Random.withSeed((seedBase + minute * 0x100) >>> 0);

  let starCount: number;
  if (pattern === Pattern.Fine00) {
    // Heavy shower
    if (rng.rollMax(100) >= 50) return null;
    starCount = rng.rollMax(100) < 50 ? 8 : 5;
  } else if (pattern === Pattern.Fine02 || pattern === Pattern.Fine04 || pattern === Pattern.Fine06) {
    // Light shower
    const chance = (minute & 1) === 0 ? 2 : 4;
    if (rng.rollMax(60) >= chance) return null;
    starCount = 5;
  } else {
    return null;
  }

  let starField = 0n;
  let remaining = starCount;
  while (remaining > 0) {
    const bit = rng.rollMax(60);
    const mask = 1n << BigInt(bit);
    if ((starField & mask) === 0n) {
      starField |= mask;
      remaining--;
    }
  }
  return { count: starCount, secondField: starField };
}

/**
 * Full star query for a specific date/hour/minute.
 * Returns the star count and populates the seconds array.
 */
export function queryStars(
  seed: number,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  pattern: Pattern
): { count: number; seconds: number[] } {
  const [ny, nm, nd] = normaliseLateYMD(year, month, day, hour);
  const hourSeed = computeSeedYMDH(seed, 0x20000, 0x2000, 0x100, 0x10000, ny, nm, nd, hour);
  const result = queryStarsInternal(hourSeed, minute, pattern);
  if (!result) return { count: 0, seconds: [] };

  const seconds: number[] = [];
  for (let s = 0; s < 60; s++) {
    if ((result.secondField & (1n << BigInt(s))) !== 0n) {
      seconds.push(s);
    }
  }
  return { count: result.count, seconds };
}

// ========================== RAINBOW ==========================

export interface RainbowInfo {
  count: number; // 0 = no rainbow, 1 = single, 2 = double
  hour: number;  // hour when rainbow appears (0 if none)
}

export function getRainbowInfo(
  hemi: Hemisphere,
  seed: number,
  year: number,
  month: number,
  day: number,
  pattern: Pattern
): RainbowInfo {
  if (getSpWeatherLevel(hemi, month, day) === SpWeatherLevel.Rainbow) {
    const kind = getPatternKind(pattern);
    if (kind === PatternKind.CloudFine || kind === PatternKind.FineRain) {
      const rbSeed = computeSeedYMD(seed, 0x1000000, 0x40000, 0x1000, year, month, day);
      const rng = Random.withSeed(rbSeed);
      rng.roll();
      rng.roll();
      const rainbowCount = (rng.roll() & 1) === 0 ? 1 : 2;
      for (let h = 7; h <= 17; h++) {
        const a = PATTERNS[pattern][h];
        const b = PATTERNS[pattern][h + 1];
        if ((a === Weather.Rain || a === Weather.HeavyRain) && (b === Weather.Clear || b === Weather.Sunny)) {
          return { count: rainbowCount, hour: h + 1 };
        }
      }
    }
  }
  return { count: 0, hour: 0 };
}

// ========================== ENVIRONMENTAL QUERIES ==========================

export function getSpWeatherLevel(hemi: Hemisphere, month: number, day: number): SpWeatherLevel {
  if (hemi === Hemisphere.Northern) {
    if ((month === 12 && day >= 11) || month === 1 || (month === 2 && day <= 24)) return SpWeatherLevel.Aurora;
    if ((month === 2 && day >= 25) || (month >= 3 && month <= 10) || (month === 11 && day <= 25)) return SpWeatherLevel.Rainbow;
  } else {
    if ((month === 6 && day >= 11) || month === 7 || (month === 8 && day <= 24)) return SpWeatherLevel.Aurora;
    if ((month === 8 && day >= 25) || (month >= 9 && month <= 12) || (month >= 1 && month <= 4) || (month === 5 && day <= 25)) return SpWeatherLevel.Rainbow;
  }
  return SpWeatherLevel.None;
}

export function getSnowLevel(hemi: Hemisphere, month: number, day: number): SnowLevel {
  if (hemi === Hemisphere.Northern) {
    if ((month === 11 && day >= 26) || (month === 12 && day <= 10)) return SnowLevel.Low;
    if ((month === 12 && day >= 11) || month === 1 || (month === 2 && day <= 24)) return SnowLevel.Full;
  } else {
    if ((month === 5 && day >= 26) || (month === 6 && day <= 10)) return SnowLevel.Low;
    if ((month === 6 && day >= 11) || month === 7 || (month === 8 && day <= 24)) return SnowLevel.Full;
  }
  return SnowLevel.None;
}

export function getCloudLevel(hemi: Hemisphere, month: number, day: number): CloudLevel {
  if (hemi === Hemisphere.Northern) {
    if ((month === 7 && day >= 21) || month === 8 || (month === 9 && day <= 15)) return CloudLevel.Cumulonimbus;
    if ((month === 9 && day >= 16) || month === 10 || month === 11) return CloudLevel.Cirrus;
    if (month === 12 || month === 1 || month === 2) return CloudLevel.Billow;
    if (month === 3 || month === 4 || month === 5) return CloudLevel.Thin;
  } else {
    if ((month === 1 && day >= 21) || month === 2 || (month === 3 && day <= 15)) return CloudLevel.Cumulonimbus;
    if ((month === 3 && day >= 16) || month === 4 || month === 5) return CloudLevel.Cirrus;
    if (month === 6 || month === 7 || month === 8) return CloudLevel.Billow;
    if (month === 9 || month === 10 || month === 11) return CloudLevel.Thin;
  }
  return CloudLevel.None;
}

export function getFogLevel(hemi: Hemisphere, month: number, day: number): FogLevel {
  if (hemi === Hemisphere.Northern) {
    if ((month === 9 && day >= 21) || (month >= 10 && month <= 12) || month === 1 || (month === 2 && day <= 24)) return FogLevel.HeavyAndWater;
    if ((month === 2 && day >= 25) || month === 3) return FogLevel.WaterOnly;
  } else {
    if ((month === 3 && day >= 21) || (month >= 4 && month <= 7) || (month === 8 && day <= 24)) return FogLevel.HeavyAndWater;
    if ((month === 8 && day >= 25) || month === 9) return FogLevel.WaterOnly;
  }
  return FogLevel.None;
}

export function checkWaterFog(seed: number, year: number, month: number, day: number): boolean {
  const rng = Random.withState(
    (year << 8) >>> 0,
    (month << 8) >>> 0,
    (day << 8) >>> 0,
    (seed | 0x80000000) >>> 0
  );
  rng.roll();
  rng.roll();
  return (rng.roll() & 1) === 1;
}

export function isAuroraPattern(hemi: Hemisphere, month: number, day: number, pattern: Pattern): boolean {
  if (getSpWeatherLevel(hemi, month, day) === SpWeatherLevel.Aurora) {
    return pattern === Pattern.Fine01 || pattern === Pattern.Fine03 || pattern === Pattern.Fine05;
  }
  return false;
}

export function getConstellation(month: number, day: number): Constellation {
  if (month === 1 && day <= 19) return Constellation.Capricorn;
  if (month === 1) return Constellation.Aquarius;
  if (month === 2 && day <= 18) return Constellation.Aquarius;
  if (month === 2) return Constellation.Pisces;
  if (month === 3 && day <= 20) return Constellation.Pisces;
  if (month === 3) return Constellation.Aries;
  if (month === 4 && day <= 19) return Constellation.Aries;
  if (month === 4) return Constellation.Taurus;
  if (month === 5 && day <= 20) return Constellation.Taurus;
  if (month === 5) return Constellation.Gemini;
  if (month === 6 && day <= 21) return Constellation.Gemini;
  if (month === 6) return Constellation.Cancer;
  if (month === 7 && day <= 22) return Constellation.Cancer;
  if (month === 7) return Constellation.Leo;
  if (month === 8 && day <= 22) return Constellation.Leo;
  if (month === 8) return Constellation.Virgo;
  if (month === 9 && day <= 22) return Constellation.Virgo;
  if (month === 9) return Constellation.Libra;
  if (month === 10 && day <= 23) return Constellation.Libra;
  if (month === 10) return Constellation.Scorpio;
  if (month === 11 && day <= 22) return Constellation.Scorpio;
  if (month === 11) return Constellation.Sagittarius;
  if (month === 12 && day <= 21) return Constellation.Sagittarius;
  return Constellation.Capricorn;
}

// ========================== WIND ==========================

export function getWindPower(
  seed: number,
  year: number,
  month: number,
  day: number,
  hour: number,
  pattern: Pattern
): number {
  const [ny, nm, nd] = normaliseLateYMD(year, month, day, hour);
  const windSeed = computeSeedYMDH(seed, 0x2000000, 0x200000, 0x10000, 1, ny, nm, nd, hour);
  const rng = Random.withSeed(windSeed);
  rng.roll();
  rng.roll();
  const windType = WINDS[pattern][hour];
  switch (windType) {
    case WindType.Calm: return 0;
    case WindType.Land0: case WindType.Sea0: return rng.rollMax8(3);
    case WindType.Land1: case WindType.Sea1: return rng.rollMax8(4) + 1;
    case WindType.Land2: case WindType.Sea2: return rng.rollMax8(3) + 3;
    default: return 0;
  }
}

export function getWindPowerMin(hour: number, pattern: Pattern): number {
  const w = WINDS[pattern][hour];
  if (w === WindType.Calm) return 0;
  if (w === WindType.Land0 || w === WindType.Sea0) return 0;
  if (w === WindType.Land1 || w === WindType.Sea1) return 1;
  return 3; // Land2, Sea2
}

export function getWindPowerMax(hour: number, pattern: Pattern): number {
  const w = WINDS[pattern][hour];
  if (w === WindType.Calm) return 0;
  if (w === WindType.Land0 || w === WindType.Sea0) return 3;
  if (w === WindType.Land1 || w === WindType.Sea1) return 4;
  return 5; // Land2, Sea2
}

export function isPatternPossibleAtDate(hemi: Hemisphere, month: number, day: number, pattern: Pattern): boolean {
  const rateSet = hemi === Hemisphere.Northern
    ? RATE_LOOKUP_N[month - 1][day - 1]
    : RATE_LOOKUP_S[month - 1][day - 1];
  return RATE_MAPS[rateSet].includes(pattern);
}
