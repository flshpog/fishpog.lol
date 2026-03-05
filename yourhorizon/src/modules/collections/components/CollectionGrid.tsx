"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { db } from "@/lib/db/database";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterBar, type FilterOption } from "@/components/ui/FilterBar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { VirtualizedGrid } from "@/components/ui/VirtualizedGrid";
import { useCollectionStore } from "../store/collectionStore";
import type { BaseRecord } from "@/types/data";

interface CollectionItem extends BaseRecord {
  iconUri?: string;
  imageUri?: string;
  category?: string;
  source?: string;
  buyPrice?: number | null;
  sellPrice?: number | null;
  variant?: string | null;
  isOrderable?: boolean;
  materials?: Record<string, number>;
  sourceNotes?: string;
}

const STATUS_FILTERS: FilterOption[] = [
  { label: "All", value: "all" },
  { label: "Not Collected", value: "missing" },
  { label: "Collected", value: "collected" },
];

interface CollectionGridProps {
  category: string;
  tableNames: string[];
  showCategory?: boolean;
}

export function CollectionGrid({ category, tableNames, showCategory = false }: CollectionGridProps) {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const { collectedIds, toggleCollected } = useCollectionStore();
  const collected = collectedIds[category] ?? [];

  useEffect(() => {
    async function load() {
      const allItems: CollectionItem[] = [];
      for (const table of tableNames) {
        const data = await db.table(table).toArray();
        allItems.push(...(data as CollectionItem[]));
      }
      setItems(allItems);
      setLoading(false);
    }
    load();
  }, [tableNames]);

  const categoryOptions = useMemo<FilterOption[]>(() => {
    if (!showCategory) return [];
    const cats = new Set(items.map((i) => i.category).filter(Boolean));
    return [
      { label: "All", value: "all" },
      ...Array.from(cats)
        .sort()
        .map((c) => ({ label: c!, value: c! })),
    ];
  }, [items, showCategory]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const isCollected = collected.includes(item.id);
      if (statusFilter === "collected" && !isCollected) return false;
      if (statusFilter === "missing" && isCollected) return false;

      if (showCategory && categoryFilter !== "all" && item.category !== categoryFilter) return false;

      if (search) {
        const q = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          (item.category?.toLowerCase().includes(q) ?? false) ||
          (item.source?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [items, search, statusFilter, categoryFilter, collected, showCategory]);

  const renderItem = useCallback(
    (item: CollectionItem) => {
      const isCollected = collected.includes(item.id);
      return (
        <div
          className={`relative rounded-xl bg-bg-card border border-border p-2 flex flex-col items-center text-center cursor-pointer hover:bg-bg-hover transition-colors ${
            isCollected ? "ring-2 ring-caught" : "ring-1 ring-not-caught/50"
          }`}
          onClick={() => toggleCollected(category, item.id)}
        >
          {item.imageUri || item.iconUri ? (
            <img
              src={item.imageUri || item.iconUri}
              alt={item.name}
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
              loading="lazy"
            />
          ) : (
            <div className="w-10 h-10 rounded bg-bg-hover flex items-center justify-center">
              <span className="text-xs text-text-muted font-medium">{item.name.charAt(0)}</span>
            </div>
          )}
          <span className="text-xs text-text mt-1 leading-tight line-clamp-2">{item.name}</span>
          {item.sellPrice != null && item.sellPrice > 0 && (
            <span className="text-xs text-text-muted">{item.sellPrice.toLocaleString()}</span>
          )}
          {isCollected && (
            <Badge variant="collected" className="mt-1">Collected</Badge>
          )}
        </div>
      );
    },
    [collected, category, toggleCollected]
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-3 border-border border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <Card>
        <ProgressBar label="Collected" value={collected.length} max={items.length} />
      </Card>

      {/* Filters */}
      <SearchInput onSearch={setSearch} placeholder={`Search ${category}...`} className="max-w-sm" />
      <FilterBar options={STATUS_FILTERS} selected={statusFilter} onSelect={setStatusFilter} />
      {showCategory && categoryOptions.length > 2 && (
        <FilterBar options={categoryOptions} selected={categoryFilter} onSelect={setCategoryFilter} />
      )}

      <p className="text-sm text-text-muted">{filtered.length} of {items.length} shown</p>

      {/* Virtualized Grid */}
      {filtered.length > 0 ? (
        <VirtualizedGrid
          items={filtered}
          renderItem={renderItem}
          estimateRowHeight={120}
          gap={8}
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-text-muted">No items match your filters.</p>
        </div>
      )}

      <p className="text-xs text-text-muted">Click to toggle collected.</p>
    </div>
  );
}
