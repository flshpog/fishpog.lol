import type { MonthlyAvailability, TimeRange, Month } from "./common";

/** Base interface for all normalized records */
export interface BaseRecord {
  id: string;
  name: string;
}

/** Villager (413 total) */
export interface NormalizedVillager extends BaseRecord {
  species: string;
  personality: string;
  hobby: string;
  birthday: string;
  gender: string;
  catchphrase: string;
  iconUri: string;
  imageUri: string;
}

/** Fish (80 total) */
export interface NormalizedFish extends BaseRecord {
  location: string;
  shadow: string;
  rarity: string;
  price: number;
  availability: MonthlyAvailability;
  time: TimeRange[];
  iconUri: string;
  imageUri: string;
}

/** Bug (80 total) */
export interface NormalizedBug extends BaseRecord {
  location: string;
  rarity: string;
  price: number;
  availability: MonthlyAvailability;
  time: TimeRange[];
  iconUri: string;
  imageUri: string;
}

/** Sea Creature (40 total) */
export interface NormalizedSeaCreature extends BaseRecord {
  shadow: string;
  speed: string;
  rarity: string;
  price: number;
  availability: MonthlyAvailability;
  time: TimeRange[];
  iconUri: string;
  imageUri: string;
}

/** Fossil (73 unique) */
export interface NormalizedFossil extends BaseRecord {
  price: number;
  partOf: string;
  imageUri: string;
}

/** Art (43 genuine pieces) */
export interface NormalizedArt extends BaseRecord {
  hasFake: boolean;
  buyPrice: number;
  sellPrice: number;
  imageUri: string;
  fakeImageUri?: string;
}

/** Item (~24,000 total with variants — furniture, clothing, wallpaper, tools, etc.) */
export interface NormalizedItem extends BaseRecord {
  category: string;
  source: string;
  buyPrice: number | null;
  sellPrice: number | null;
  variant: string | null;
  imageUri: string;
}

/** K.K. Slider Song (~110) */
export interface NormalizedSong extends BaseRecord {
  isOrderable: boolean;
  buyPrice: number | null;
  sellPrice: number;
  imageUri: string;
}

/** DIY Recipe (~924) */
export interface NormalizedDIYRecipe extends BaseRecord {
  category: string;
  materials: Record<string, number>;
  source: string;
  sellPrice: number;
  imageUri: string;
}

/** Reaction (~88) */
export interface NormalizedReaction extends BaseRecord {
  source: string;
  sourceNotes: string;
  imageUri: string;
}

/** Event */
export interface NormalizedEvent extends BaseRecord {
  month: number[];
  dates: string;
  description: string;
  isRecurring: boolean;
}

/** Flower */
export interface NormalizedFlower extends BaseRecord {
  type: string;
  color: string;
  genes: string;
  hybridParents: Array<{ parent1: string; parent2: string; probability: number }>;
  imageUri: string;
}

/** Mystery Island (18 types) */
export interface NormalizedMysteryIsland extends BaseRecord {
  resources: string;
  spawnRate: number;
  nativeFruit: boolean;
  rockCount: number;
  description: string;
  imageUri: string;
}

/** NPC Visitor (11) */
export interface NormalizedNPCVisitor extends BaseRecord {
  schedule: string;
  description: string;
  imageUri: string;
}

/** Metadata for data loading tracking */
export interface DataMeta {
  category: string;
  version: string;
  lastLoaded: number;
}

/** Turnip week data for persistence */
export interface TurnipWeekData {
  purchasePrice: number | null;
  previousPattern: string | null;
  isFirstTime: boolean;
  prices: Array<{ am: number | null; pm: number | null }>;
}
