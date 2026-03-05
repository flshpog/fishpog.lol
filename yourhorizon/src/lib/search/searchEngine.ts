import MiniSearch from "minisearch";
import type { SearchableDocument, SearchResult } from "@/types/search";
import type { BaseRecord } from "@/types/data";
import type { DataSource } from "@/lib/data/dataCatalog";

let searchIndex: MiniSearch<SearchableDocument> | null = null;

/**
 * Build the global search index from loaded data.
 */
export function buildSearchIndex(
  dataMap: Map<string, BaseRecord[]>,
  catalog: DataSource[]
): MiniSearch<SearchableDocument> {
  const documents: SearchableDocument[] = [];

  for (const source of catalog) {
    const records = dataMap.get(source.id);
    if (!records) continue;

    for (const record of records) {
      const doc: SearchableDocument = {
        id: `${source.id}:${record.id}`,
        category: source.id,
        name: record.name,
        subcategory: getSubcategory(record, source),
        tags: getTags(record, source),
      };
      documents.push(doc);
    }
  }

  const index = new MiniSearch<SearchableDocument>({
    fields: ["name", "subcategory", "tags"],
    storeFields: ["name", "category", "subcategory"],
    idField: "id",
    searchOptions: {
      boost: { name: 3, subcategory: 1.5, tags: 1 },
      fuzzy: 0.2,
      prefix: true,
    },
  });

  index.addAll(documents);
  searchIndex = index;
  return index;
}

/**
 * Add more documents to the existing search index (for deferred loading).
 */
export function addToSearchIndex(
  records: BaseRecord[],
  source: DataSource
): void {
  if (!searchIndex) return;

  const documents: SearchableDocument[] = records.map((record) => ({
    id: `${source.id}:${record.id}`,
    category: source.id,
    name: record.name,
    subcategory: getSubcategory(record, source),
    tags: getTags(record, source),
  }));

  searchIndex.addAll(documents);
}

/**
 * Search the global index. Returns empty array if index not built yet.
 */
export function search(query: string, limit = 20): SearchResult[] {
  if (!searchIndex || !query.trim()) return [];

  return searchIndex
    .search(query)
    .slice(0, limit)
    .map((result) => ({
      id: result.id,
      category: (result as unknown as SearchableDocument).category,
      name: (result as unknown as SearchableDocument).name,
      subcategory: (result as unknown as SearchableDocument).subcategory,
      score: result.score,
    }));
}

/**
 * Check if the search index is ready.
 */
export function isSearchReady(): boolean {
  return searchIndex !== null;
}

/** Extract subcategory from a record based on its data source */
function getSubcategory(
  record: BaseRecord,
  source: DataSource
): string | undefined {
  const rec = record as unknown as Record<string, unknown>;
  if (source.searchFields.length > 1) {
    const field = source.searchFields[1];
    const value = rec[field];
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
}

/** Build a tags string from all searchable fields */
function getTags(
  record: BaseRecord,
  source: DataSource
): string {
  const rec = record as unknown as Record<string, unknown>;
  return source.searchFields
    .slice(1)
    .map((field) => rec[field])
    .filter((v) => typeof v === "string")
    .join(" ");
}
