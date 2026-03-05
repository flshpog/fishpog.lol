"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/db/database";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterBar, type FilterOption } from "@/components/ui/FilterBar";
import type { NormalizedFlower } from "@/types/data";

const CDN = "https://nh-cdn.catalogue.ac/FtrIcon";

// Map flower type + color to CDN sprite URL
// Lily = "Yuri" in ACNH internal naming
// Windflower and Pansy Orange don't have sprites on CDN, use fallback
const TYPE_CDN_MAP: Record<string, string> = {
  Rose: "Rose",
  Tulip: "Tulip",
  Pansy: "Pansy",
  Cosmos: "Cosmos",
  Lily: "Yuri",
  Hyacinth: "Hyacinth",
  Mum: "Mum",
};

function getFlowerSpriteUrl(type: string, color: string): string | null {
  const cdnType = TYPE_CDN_MAP[type];
  if (!cdnType) return null;
  // These specific combos are confirmed to exist on the CDN
  return `${CDN}/Flw${cdnType}${color}.png`;
}

const TYPE_FILTERS: FilterOption[] = [
  { label: "All", value: "all" },
  { label: "Rose", value: "Rose" },
  { label: "Tulip", value: "Tulip" },
  { label: "Pansy", value: "Pansy" },
  { label: "Cosmos", value: "Cosmos" },
  { label: "Lily", value: "Lily" },
  { label: "Hyacinth", value: "Hyacinth" },
  { label: "Windflower", value: "Windflower" },
  { label: "Mum", value: "Mum" },
];

const SOURCE_FILTERS: FilterOption[] = [
  { label: "All", value: "all" },
  { label: "Seed", value: "seed" },
  { label: "Hybrid Only", value: "hybrid" },
];

const COLOR_FILTERS: FilterOption[] = [
  { label: "All", value: "all" },
  { label: "Red", value: "Red" },
  { label: "Yellow", value: "Yellow" },
  { label: "White", value: "White" },
  { label: "Pink", value: "Pink" },
  { label: "Orange", value: "Orange" },
  { label: "Purple", value: "Purple" },
  { label: "Black", value: "Black" },
  { label: "Blue", value: "Blue" },
  { label: "Gold", value: "Gold" },
  { label: "Green", value: "Green" },
];

export default function FlowersPage() {
  const [flowers, setFlowers] = useState<NormalizedFlower[]>([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedFlower, setSelectedFlower] = useState<NormalizedFlower | null>(null);

  useEffect(() => {
    db.flowers.toArray().then(setFlowers);
  }, []);

  const filtered = useMemo(() => {
    return flowers.filter((f) => {
      if (typeFilter !== "all" && f.type !== typeFilter) return false;
      if (colorFilter !== "all" && f.color !== colorFilter) return false;
      if (sourceFilter === "seed" && f.hybridParents.length > 0) return false;
      if (sourceFilter === "hybrid" && f.hybridParents.length === 0) return false;
      if (search) {
        const q = search.toLowerCase();
        return f.name.toLowerCase().includes(q) || f.color.toLowerCase().includes(q) || f.genes.toLowerCase().includes(q);
      }
      return true;
    });
  }, [flowers, typeFilter, sourceFilter, colorFilter, search]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text">Flower Breeding</h1>
        <p className="text-text-secondary mt-1">
          Explore hybrid paths, cross combinations, and breeding probabilities.
        </p>
      </div>

      <SearchInput onSearch={setSearch} placeholder="Search flowers..." className="max-w-sm" />
      <FilterBar options={SOURCE_FILTERS} selected={sourceFilter} onSelect={setSourceFilter} />
      <FilterBar options={TYPE_FILTERS} selected={typeFilter} onSelect={setTypeFilter} />
      <FilterBar options={COLOR_FILTERS} selected={colorFilter} onSelect={setColorFilter} />

      <p className="text-sm text-text-muted">{filtered.length} flowers</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map((flower) => (
          <Card
            key={flower.id}
            className="text-center cursor-pointer hover:bg-bg-hover transition-colors"
            onClick={() => setSelectedFlower(selectedFlower?.id === flower.id ? null : flower)}
          >
            <FlowerSprite type={flower.type} color={flower.color} size={40} className="mx-auto mb-2" />
            <p className="text-sm font-semibold text-text">{flower.name}</p>
            <p className="text-xs text-text-muted font-mono">{flower.genes}</p>
            {flower.hybridParents.length > 0 ? (
              <Badge className="mt-1 text-[10px]" variant="collected">Hybrid</Badge>
            ) : (
              <Badge className="mt-1 text-[10px]">Seed</Badge>
            )}
          </Card>
        ))}
      </div>

      {/* Detail Panel */}
      {selectedFlower && (
        <Card className="border-l-4 border-l-primary-500">
          <div className="flex items-center gap-4 mb-4">
            <FlowerSprite type={selectedFlower.type} color={selectedFlower.color} size={64} className="flex-shrink-0" />
            <div>
              <h2 className="text-lg font-bold text-text">{selectedFlower.name}</h2>
              <p className="text-sm text-text-secondary">{selectedFlower.type} &middot; {selectedFlower.color}</p>
              <p className="text-xs text-text-muted font-mono mt-1">Genotype: {selectedFlower.genes}</p>
            </div>
          </div>

          {selectedFlower.hybridParents.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold text-text mb-2">Breeding Combinations</h3>
              <div className="space-y-2">
                {selectedFlower.hybridParents.map((hp, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-bg-hover">
                    <span className="text-sm text-text font-medium">{hp.parent1}</span>
                    <span className="text-text-muted">+</span>
                    <span className="text-sm text-text font-medium">{hp.parent2}</span>
                    <span className="text-text-muted">&rarr;</span>
                    <Badge>{hp.probability}%</Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-muted">
              This is a seed flower — available from Nook&apos;s Cranny or Leif.
            </p>
          )}

          <button
            onClick={() => setSelectedFlower(null)}
            className="mt-3 text-xs text-primary-500 hover:underline"
          >
            Close
          </button>
        </Card>
      )}
    </div>
  );
}

function FlowerSprite({
  type,
  color,
  size,
  className = "",
}: {
  type: string;
  color: string;
  size: number;
  className?: string;
}) {
  const spriteUrl = getFlowerSpriteUrl(type, color);

  if (spriteUrl) {
    return (
      <img
        src={spriteUrl}
        alt={`${color} ${type}`}
        width={size}
        height={size}
        className={`object-contain ${className}`}
        style={{ width: size, height: size }}
        loading="lazy"
      />
    );
  }

  // Fallback: colored circle for flowers without CDN sprites (Windflower, etc.)
  const colorHex = getFlowerColor(color);
  return (
    <div
      className={`rounded-full border-2 border-border ${className}`}
      style={{ width: size, height: size, backgroundColor: colorHex }}
    />
  );
}

function getFlowerColor(color: string): string {
  const map: Record<string, string> = {
    Red: "#dc2626", Yellow: "#eab308", White: "#f5f5f4", Pink: "#f472b6",
    Orange: "#f97316", Purple: "#a855f7", Black: "#1c1917", Blue: "#3b82f6",
    Gold: "#d4a017", Green: "#22c55e",
  };
  return map[color] ?? "#9ca3af";
}
