import { db } from "@/lib/db/database";
import { DATA_VERSION, BULK_CHUNK_SIZE } from "@/lib/utils/constants";
import type { DataSource } from "./dataCatalog";
import type { BaseRecord } from "@/types/data";

/**
 * Check if a data category is already loaded and current version.
 */
export async function isCategoryFresh(category: string): Promise<boolean> {
  const meta = await db.meta.get(category);
  if (!meta) return false;
  return meta.version === DATA_VERSION;
}

/**
 * Fetch a static JSON file from /public/data/.
 * Uses the basePath for GitHub Pages compatibility.
 */
async function fetchDataFile(fileName: string): Promise<unknown[] | null> {
  const basePath =
    process.env.NEXT_PUBLIC_BASE_PATH ?? "/yourhorizon";
  const url = `${basePath}/data/${fileName}`;
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      // Data file not yet created -- expected during early development
      return null;
    }
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json();
}

/**
 * Insert records into a Dexie table in chunks to avoid blocking the UI.
 */
async function bulkInsertChunked(
  tableName: string,
  records: BaseRecord[]
): Promise<void> {
  const table = db.table(tableName);
  await table.clear();

  for (let i = 0; i < records.length; i += BULK_CHUNK_SIZE) {
    const chunk = records.slice(i, i + BULK_CHUNK_SIZE);
    await table.bulkPut(chunk);
    // Yield to main thread to avoid blocking UI
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

/**
 * Load a single data category: fetch, normalize, store in IndexedDB.
 * Returns the loaded records for search indexing.
 */
export async function loadCategory(
  source: DataSource
): Promise<BaseRecord[]> {
  const fresh = await isCategoryFresh(source.id);
  if (fresh) {
    // Data is current, read from IndexedDB
    return db.table(source.tableName).toArray();
  }

  // Fetch and store
  const rawData = await fetchDataFile(source.fileName);

  // Data file not available yet (Phase 2 will create them)
  if (!rawData) return [];

  // Data is pre-normalized by scripts/download-data.mjs
  const records = rawData as BaseRecord[];

  await bulkInsertChunked(source.tableName, records);

  // Update meta
  await db.meta.put({
    category: source.id,
    version: DATA_VERSION,
    lastLoaded: Date.now(),
  });

  return records;
}

/**
 * Load multiple categories sequentially, calling onProgress after each.
 */
export async function loadCategories(
  sources: DataSource[],
  onProgress?: (loaded: number, total: number, category: string) => void
): Promise<Map<string, BaseRecord[]>> {
  const results = new Map<string, BaseRecord[]>();
  let loaded = 0;

  for (const source of sources) {
    try {
      const records = await loadCategory(source);
      results.set(source.id, records);
    } catch (error) {
      console.error(`Failed to load ${source.id}:`, error);
      results.set(source.id, []);
    }
    loaded++;
    onProgress?.(loaded, sources.length, source.id);
  }

  return results;
}
