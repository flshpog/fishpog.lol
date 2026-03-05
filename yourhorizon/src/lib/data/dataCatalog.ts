import type { DataCategory, DataPriority } from "@/types/common";

export interface DataSource {
  id: DataCategory;
  fileName: string;
  tableName: string;
  searchFields: string[];
  storeFields: string[];
  priority: DataPriority;
}

/**
 * Registry of all data sources. Each entry maps a data category to its
 * static JSON file, Dexie table, and search configuration.
 *
 * Priority "critical" loads first (dashboard dependencies).
 * Priority "deferred" loads after the app is interactive.
 */
export const DATA_CATALOG: DataSource[] = [
  {
    id: "villagers",
    fileName: "villagers.json",
    tableName: "villagers",
    searchFields: ["name", "species", "personality", "hobby"],
    storeFields: ["name", "species", "personality", "iconUri"],
    priority: "critical",
  },
  {
    id: "fish",
    fileName: "fish.json",
    tableName: "fish",
    searchFields: ["name", "location"],
    storeFields: ["name", "location", "iconUri"],
    priority: "critical",
  },
  {
    id: "bugs",
    fileName: "bugs.json",
    tableName: "bugs",
    searchFields: ["name", "location"],
    storeFields: ["name", "location", "iconUri"],
    priority: "critical",
  },
  {
    id: "sea",
    fileName: "sea.json",
    tableName: "seaCreatures",
    searchFields: ["name", "speed"],
    storeFields: ["name", "speed", "iconUri"],
    priority: "critical",
  },
  {
    id: "fossils",
    fileName: "fossils.json",
    tableName: "fossils",
    searchFields: ["name", "partOf"],
    storeFields: ["name", "partOf"],
    priority: "critical",
  },
  {
    id: "art",
    fileName: "art.json",
    tableName: "art",
    searchFields: ["name"],
    storeFields: ["name", "hasFake"],
    priority: "critical",
  },
  {
    id: "songs",
    fileName: "music.json",
    tableName: "songs",
    searchFields: ["name"],
    storeFields: ["name", "imageUri"],
    priority: "critical",
  },
  {
    id: "items",
    fileName: "items.json",
    tableName: "items",
    searchFields: ["name", "category"],
    storeFields: ["name", "category", "imageUri"],
    priority: "deferred",
  },
  {
    id: "diy-recipes",
    fileName: "diy-recipes.json",
    tableName: "diyRecipes",
    searchFields: ["name", "category"],
    storeFields: ["name", "category", "imageUri"],
    priority: "deferred",
  },
  {
    id: "events",
    fileName: "events.json",
    tableName: "events",
    searchFields: ["name"],
    storeFields: ["name", "dates"],
    priority: "critical",
  },
  {
    id: "reactions",
    fileName: "reactions.json",
    tableName: "reactions",
    searchFields: ["name", "source"],
    storeFields: ["name", "source"],
    priority: "deferred",
  },
  {
    id: "flowers",
    fileName: "flowers.json",
    tableName: "flowers",
    searchFields: ["name", "type", "color"],
    storeFields: ["name", "type", "color"],
    priority: "deferred",
  },
  {
    id: "mystery-islands",
    fileName: "mystery-islands.json",
    tableName: "mysteryIslands",
    searchFields: ["name"],
    storeFields: ["name", "resources"],
    priority: "deferred",
  },
  {
    id: "npc-visitors",
    fileName: "npc-visitors.json",
    tableName: "npcVisitors",
    searchFields: ["name"],
    storeFields: ["name"],
    priority: "deferred",
  },
];

/** Get all critical data sources (load first) */
export function getCriticalSources(): DataSource[] {
  return DATA_CATALOG.filter((s) => s.priority === "critical");
}

/** Get all deferred data sources (load after app is interactive) */
export function getDeferredSources(): DataSource[] {
  return DATA_CATALOG.filter((s) => s.priority === "deferred");
}

/** Get total number of data categories */
export function getTotalCategories(): number {
  return DATA_CATALOG.length;
}
