"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { db } from "@/lib/db/database";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterBar, type FilterOption } from "@/components/ui/FilterBar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { VirtualizedGrid } from "@/components/ui/VirtualizedGrid";
import { useMuseumStore } from "../store/museumStore";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useSettingsStore } from "@/store/settingsStore";
import type { BaseRecord } from "@/types/data";

interface CritterItem extends BaseRecord {
  iconUri?: string;
  imageUri?: string;
  price?: number;
  location?: string;
  shadow?: string;
  rarity?: string;
  speed?: string;
  partOf?: string;
  hasFake?: boolean;
  availability?: { northern: number[]; southern: number[] };
  time?: Array<{ start: number; end: number }>;
}

const STATUS_FILTERS: FilterOption[] = [
  { label: "All", value: "all" },
  { label: "Not Caught", value: "not-caught" },
  { label: "Caught", value: "caught" },
  { label: "Donated", value: "donated" },
];

const AVAILABILITY_FILTERS: FilterOption[] = [
  { label: "All", value: "all" },
  { label: "Available Now", value: "now" },
  { label: "This Month", value: "month" },
];

interface CritterGridProps {
  category: string;
  tableName: string;
  showAvailability?: boolean;
}

export function CritterGrid({ category, tableName, showAvailability = false }: CritterGridProps) {
  const [items, setItems] = useState<CritterItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [availFilter, setAvailFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const { caughtIds, donatedIds, markCaught, unmarkCaught, markDonated, unmarkDonated } =
    useMuseumStore();
  const { month, hour } = useCurrentTime();
  const hemisphere = useSettingsStore((s) => s.hemisphere);

  const caught = caughtIds[category] ?? [];
  const donated = donatedIds[category] ?? [];

  useEffect(() => {
    db.table(tableName)
      .toArray()
      .then((data) => {
        setItems(data as CritterItem[]);
        setLoading(false);
      });
  }, [tableName]);

  const filtered = useMemo(() => {
    const monthKey = hemisphere === "northern" ? "northern" : "southern";

    return items.filter((item) => {
      const isDonated = donated.includes(item.id);
      const isCaught = caught.includes(item.id);
      if (statusFilter === "donated" && !isDonated) return false;
      if (statusFilter === "caught" && !isCaught) return false;
      if (statusFilter === "not-caught" && isCaught) return false;

      if (showAvailability && item.availability && availFilter !== "all") {
        const months = item.availability[monthKey];
        if (availFilter === "month" && !months?.includes(month)) return false;
        if (availFilter === "now") {
          if (!months?.includes(month)) return false;
          if (item.time && item.time.length > 0) {
            const inTime = item.time.some((t) => {
              if (t.start <= t.end) return hour >= t.start && hour < t.end;
              return hour >= t.start || hour < t.end;
            });
            if (!inTime) return false;
          }
        }
      }

      if (search) {
        const q = search.toLowerCase();
        return item.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [items, search, statusFilter, availFilter, caught, donated, month, hour, hemisphere, showAvailability]);

  const getStatus = useCallback(
    (id: string) => {
      if (donated.includes(id)) return "donated";
      if (caught.includes(id)) return "caught";
      return "not-caught";
    },
    [caught, donated]
  );

  const toggleCaught = useCallback(
    (id: string) => {
      if (caught.includes(id)) {
        unmarkCaught(category, id);
        unmarkDonated(category, id);
      } else {
        markCaught(category, id);
      }
    },
    [caught, category, markCaught, unmarkCaught, unmarkDonated]
  );

  const toggleDonated = useCallback(
    (id: string) => {
      if (donated.includes(id)) {
        unmarkDonated(category, id);
      } else {
        markDonated(category, id);
      }
    },
    [donated, category, markDonated, unmarkDonated]
  );

  const renderItem = useCallback(
    (item: CritterItem) => {
      const status = getStatus(item.id);
      const borderClass =
        status === "donated"
          ? "ring-2 ring-donated"
          : status === "caught"
          ? "ring-2 ring-caught"
          : "ring-1 ring-not-caught/50";

      return (
        <div
          className={`relative rounded-xl bg-bg-card border border-border p-2 flex flex-col items-center text-center cursor-pointer hover:bg-bg-hover transition-colors ${borderClass}`}
          onClick={() => toggleCaught(item.id)}
          onContextMenu={(e) => {
            e.preventDefault();
            toggleDonated(item.id);
          }}
        >
          {item.iconUri ? (
            <img
              src={item.iconUri}
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
          {item.price !== undefined && (
            <span className="text-xs text-text-muted">{item.price.toLocaleString()}</span>
          )}
          {status !== "not-caught" && (
            <Badge
              variant={status === "donated" ? "donated" : "collected"}
              className="mt-1"
            >
              {status === "donated" ? "D" : "C"}
            </Badge>
          )}
        </div>
      );
    },
    [getStatus, toggleCaught, toggleDonated]
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card>
          <ProgressBar label="Caught" value={caught.length} max={items.length} />
        </Card>
        <Card>
          <ProgressBar label="Donated" value={donated.length} max={items.length} />
        </Card>
      </div>

      {/* Filters */}
      <SearchInput onSearch={setSearch} placeholder={`Search ${category}...`} className="max-w-sm" />
      <FilterBar options={STATUS_FILTERS} selected={statusFilter} onSelect={setStatusFilter} />
      {showAvailability && (
        <FilterBar options={AVAILABILITY_FILTERS} selected={availFilter} onSelect={setAvailFilter} />
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

      <p className="text-xs text-text-muted">
        Click to toggle caught. Right-click to toggle donated.
      </p>
    </div>
  );
}
