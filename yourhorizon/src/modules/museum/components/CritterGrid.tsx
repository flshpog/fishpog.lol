"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { db } from "@/lib/db/database";
import { Card } from "@/components/ui/Card";
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

const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

function formatTimeRanges(ranges?: Array<{ start: number; end: number }>): string {
  if (!ranges || ranges.length === 0) return "All day";
  return ranges.map((r) => `${formatHour(r.start)} – ${formatHour(r.end)}`).join(", ");
}

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
  const [selectedItem, setSelectedItem] = useState<CritterItem | null>(null);

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
      if (search) return item.name.toLowerCase().includes(search.toLowerCase());
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
          ? "border-2 border-donated"
          : status === "caught"
          ? "border-2 border-caught"
          : "border border-border";

      return (
        <div
          className={`relative rounded-xl bg-bg-card px-2 pb-2 pt-6 flex flex-col items-center text-center cursor-pointer hover:bg-bg-hover transition-all duration-300 ${borderClass}`}
          onClick={() => setSelectedItem(item)}
          onContextMenu={(e) => {
            e.preventDefault();
            toggleDonated(item.id);
          }}
        >
          {/* C/D badge — absolute top-left, never affects card height */}
          {status !== "not-caught" && (
            <div className="absolute top-1.5 left-1.5 flex gap-px">
              {status === "caught" && (
                <span className="w-5 h-5 rounded-full bg-caught text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                  C
                </span>
              )}
              {status === "donated" && (
                <>
                  <span className="w-5 h-5 rounded-full bg-caught text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                    C
                  </span>
                  <span className="w-5 h-5 rounded-full bg-donated text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                    D
                  </span>
                </>
              )}
            </div>
          )}

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
        </div>
      );
    },
    [getStatus, toggleDonated]
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-3 border-border border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  const selectedStatus = selectedItem ? getStatus(selectedItem.id) : "not-caught";
  const hemiKey = hemisphere === "northern" ? "northern" : "southern";

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

      {/* Grid */}
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
        Tap to view details. Right-click to quickly toggle donated.
      </p>

      {/* Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="w-full max-w-md bg-bg-card rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`px-5 py-4 flex items-center gap-4 border-b border-border ${
              selectedStatus === "donated"
                ? "bg-donated/10"
                : selectedStatus === "caught"
                ? "bg-caught/10"
                : "bg-bg-hover"
            }`}>
              {selectedItem.iconUri ? (
                <img
                  src={selectedItem.iconUri}
                  alt={selectedItem.name}
                  width={56}
                  height={56}
                  className="w-14 h-14 object-contain flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-bg-hover flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-text-muted">{selectedItem.name.charAt(0)}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-text capitalize">{selectedItem.name}</h3>
                {selectedItem.price !== undefined && (
                  <p className="text-sm text-text-muted">{selectedItem.price.toLocaleString()} bells</p>
                )}
                {selectedItem.rarity && (
                  <p className="text-xs text-text-muted capitalize">{selectedItem.rarity}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg hover:bg-bg-hover transition-colors text-text-muted"
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Info rows */}
            <div className="px-5 py-4 space-y-3">
              {selectedItem.location && (
                <div className="flex items-start gap-3">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wide w-16 flex-shrink-0 mt-0.5">Location</span>
                  <span className="text-sm text-text">{selectedItem.location}</span>
                </div>
              )}

              {selectedItem.shadow && (
                <div className="flex items-start gap-3">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wide w-16 flex-shrink-0 mt-0.5">Shadow</span>
                  <span className="text-sm text-text capitalize">{selectedItem.shadow}</span>
                </div>
              )}

              {selectedItem.speed && (
                <div className="flex items-start gap-3">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wide w-16 flex-shrink-0 mt-0.5">Speed</span>
                  <span className="text-sm text-text capitalize">{selectedItem.speed}</span>
                </div>
              )}

              {showAvailability && (
                <div className="flex items-start gap-3">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wide w-16 flex-shrink-0 mt-0.5">Active</span>
                  <span className="text-sm text-text">{formatTimeRanges(selectedItem.time)}</span>
                </div>
              )}

              {showAvailability && selectedItem.availability && (
                <div className="flex items-start gap-3">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wide w-16 flex-shrink-0 mt-0.5">Months</span>
                  <div className="flex flex-wrap gap-1">
                    {MONTH_ABBR.map((abbr, i) => {
                      const monthNum = i + 1;
                      const available = selectedItem.availability![hemiKey]?.includes(monthNum);
                      return (
                        <span
                          key={abbr}
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            available
                              ? "bg-primary-500 text-white"
                              : "bg-bg-hover text-text-muted"
                          }`}
                        >
                          {abbr}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="px-5 pb-5 flex gap-3">
              <button
                onClick={() => {
                  toggleCaught(selectedItem.id);
                  setSelectedItem(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  selectedStatus === "caught" || selectedStatus === "donated"
                    ? "bg-caught/20 text-caught border border-caught/40 hover:bg-caught/30"
                    : "bg-caught text-white hover:bg-caught/80"
                }`}
              >
                {selectedStatus === "caught" || selectedStatus === "donated" ? "Unmark Caught" : "Mark Caught"}
              </button>
              <button
                onClick={() => {
                  toggleDonated(selectedItem.id);
                  setSelectedItem(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  selectedStatus === "donated"
                    ? "bg-donated/20 text-donated border border-donated/40 hover:bg-donated/30"
                    : "bg-donated text-white hover:bg-donated/80"
                }`}
              >
                {selectedStatus === "donated" ? "Unmark Donated" : "Mark Donated"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
