"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { db } from "@/lib/db/database";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterBar, type FilterOption } from "@/components/ui/FilterBar";
import { VirtualizedGrid } from "@/components/ui/VirtualizedGrid";
import { VillagerCard } from "./VillagerCard";
import { VillagerDetail } from "./VillagerDetail";
import { useVillagerStore } from "../store/villagerStore";
import type { NormalizedVillager } from "@/types/data";

const PERSONALITY_FILTERS: FilterOption[] = [
  { label: "All", value: "all" },
  { label: "Normal", value: "Normal" },
  { label: "Peppy", value: "Peppy" },
  { label: "Lazy", value: "Lazy" },
  { label: "Jock", value: "Jock" },
  { label: "Cranky", value: "Cranky" },
  { label: "Snooty", value: "Snooty" },
  { label: "Smug", value: "Smug" },
  { label: "Sisterly", value: "Sisterly" },
];

const SPECIES_FILTERS: FilterOption[] = [
  { label: "All Species", value: "all" },
  { label: "Cat", value: "Cat" },
  { label: "Dog", value: "Dog" },
  { label: "Rabbit", value: "Rabbit" },
  { label: "Squirrel", value: "Squirrel" },
  { label: "Duck", value: "Duck" },
  { label: "Bear", value: "Bear" },
  { label: "Deer", value: "Deer" },
  { label: "Eagle", value: "Eagle" },
  { label: "Frog", value: "Frog" },
  { label: "Wolf", value: "Wolf" },
];

type ViewMode = "all" | "island" | "favorites";

const VILLAGER_BREAKPOINTS: [number, number][] = [
  [0, 2],      // base: 2 cols
  [640, 3],    // sm: 3 cols
  [768, 4],    // md: 4 cols
  [1024, 5],   // lg: 5 cols
  [1280, 6],   // xl: 6 cols
];

export function VillagersPage() {
  const [villagers, setVillagers] = useState<NormalizedVillager[]>([]);
  const [search, setSearch] = useState("");
  const [personality, setPersonality] = useState("all");
  const [species, setSpecies] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [selectedVillager, setSelectedVillager] = useState<NormalizedVillager | null>(null);
  const [loading, setLoading] = useState(true);

  const { islandVillagerIds, favoriteVillagerIds } = useVillagerStore();

  useEffect(() => {
    db.villagers.toArray().then((data) => {
      setVillagers(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return villagers.filter((v) => {
      if (viewMode === "island" && !islandVillagerIds.includes(v.id)) return false;
      if (viewMode === "favorites" && !favoriteVillagerIds.includes(v.id)) return false;

      if (personality !== "all" && v.personality !== personality) return false;
      if (species !== "all" && v.species !== species) return false;

      if (search) {
        const q = search.toLowerCase();
        return (
          v.name.toLowerCase().includes(q) ||
          v.species.toLowerCase().includes(q) ||
          v.personality.toLowerCase().includes(q) ||
          v.hobby.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [villagers, search, personality, species, viewMode, islandVillagerIds, favoriteVillagerIds]);

  const VIEW_OPTIONS: FilterOption[] = [
    { label: `All (${villagers.length})`, value: "all" },
    { label: `Island (${islandVillagerIds.length}/10)`, value: "island" },
    { label: `Favorites (${favoriteVillagerIds.length})`, value: "favorites" },
  ];

  const renderVillager = useCallback(
    (v: NormalizedVillager) => (
      <VillagerCard
        villager={v}
        isOnIsland={islandVillagerIds.includes(v.id)}
        isFavorite={favoriteVillagerIds.includes(v.id)}
        onClick={() => setSelectedVillager(v)}
      />
    ),
    [islandVillagerIds, favoriteVillagerIds]
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text">Villagers</h1>
        <p className="text-text-secondary mt-1">
          Browse all {villagers.length} villagers. Search, filter, and manage your island residents.
        </p>
      </div>

      {/* View Mode Toggle */}
      <FilterBar
        options={VIEW_OPTIONS}
        selected={viewMode}
        onSelect={(v) => setViewMode(v as ViewMode)}
      />

      {/* Search + Filters */}
      <SearchInput
        onSearch={setSearch}
        placeholder="Search by name, species, personality..."
        className="max-w-sm"
      />
      <FilterBar options={PERSONALITY_FILTERS} selected={personality} onSelect={setPersonality} />
      <FilterBar options={SPECIES_FILTERS} selected={species} onSelect={setSpecies} />

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-border border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <p className="text-sm text-text-muted">{filtered.length} villagers found</p>
          {filtered.length > 0 ? (
            <VirtualizedGrid
              items={filtered}
              renderItem={renderVillager}
              estimateRowHeight={180}
              gap={12}
              breakpoints={VILLAGER_BREAKPOINTS}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-text-muted">No villagers match your filters.</p>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedVillager && (
        <VillagerDetail
          villager={selectedVillager}
          onClose={() => setSelectedVillager(null)}
        />
      )}
    </div>
  );
}
