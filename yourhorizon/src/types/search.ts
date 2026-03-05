import type { DataCategory } from "./common";

export interface SearchableDocument {
  id: string;
  category: DataCategory;
  name: string;
  subcategory?: string;
  tags?: string;
}

export interface SearchResult {
  id: string;
  category: DataCategory;
  name: string;
  subcategory?: string;
  score: number;
}
