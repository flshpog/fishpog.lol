export type Hemisphere = "northern" | "southern";

export type Season = "spring" | "summer" | "fall" | "winter";

export type Theme = "light" | "dark";

export type CritterCategory = "fish" | "bugs" | "sea" | "fossils" | "art";

export type CollectionCategory = "items" | "diy" | "songs" | "reactions";

export type DataCategory =
  | "villagers"
  | "fish"
  | "bugs"
  | "sea"
  | "fossils"
  | "art"
  | "songs"
  | "items"
  | "diy-recipes"
  | "events"
  | "reactions"
  | "flowers"
  | "mystery-islands"
  | "npc-visitors";

export type DataPriority = "critical" | "deferred";

/** Months represented as 1-12 */
export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/** Hours represented as 0-23 */
export type Hour = number;

export interface MonthlyAvailability {
  northern: number[];
  southern: number[];
}

export interface TimeRange {
  start: Hour;
  end: Hour;
}

export interface CollectionStatus {
  collected: boolean;
  donated: boolean;
  favorite: boolean;
}
