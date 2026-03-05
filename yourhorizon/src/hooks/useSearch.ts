"use client";

import { useState, useCallback, useMemo } from "react";
import { search as globalSearch } from "@/lib/search/searchEngine";
import { debounce } from "@/lib/utils/debounce";
import { SEARCH_DEBOUNCE_MS } from "@/lib/utils/constants";
import type { SearchResult } from "@/types/search";

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState("");

  const performSearch = useMemo(
    () => debounce((q: string) => {
      setResults(globalSearch(q));
    }, SEARCH_DEBOUNCE_MS),
    []
  );

  const search = useCallback(
    (q: string) => {
      setQuery(q);
      performSearch(q);
    },
    [performSearch]
  );

  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
  }, []);

  return { results, query, search, clear };
}
