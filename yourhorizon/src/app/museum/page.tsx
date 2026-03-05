"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "@/lib/db/database";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useMuseumStore } from "@/modules/museum/store/museumStore";

const CDN = "https://nh-cdn.catalogue.ac";

// Use representative game sprites for each museum category
const CATEGORIES = [
  {
    id: "fish",
    label: "Fish",
    table: "fish" as const,
    description: "River, ocean, and pond fish",
    // Sea bass icon from ACNH API
    spriteUrl: "https://raw.githubusercontent.com/alexislours/ACNHAPI/master/icons/fish/sea_bass.png",
  },
  {
    id: "bugs",
    label: "Bugs",
    table: "bugs" as const,
    description: "Insects and creepy crawlies",
    // Common butterfly icon from ACNH API
    spriteUrl: "https://raw.githubusercontent.com/alexislours/ACNHAPI/master/icons/bugs/common_butterfly.png",
  },
  {
    id: "sea",
    label: "Sea Creatures",
    table: "seaCreatures" as const,
    description: "Deep sea diving catches",
    // Scallop icon from ACNH API
    spriteUrl: "https://raw.githubusercontent.com/alexislours/ACNHAPI/master/icons/sea/scallop.png",
  },
  {
    id: "fossils",
    label: "Fossils",
    table: "fossils" as const,
    description: "Ancient bones and exhibits",
    spriteUrl: `${CDN}/FtrIcon/Fossil.png`,
  },
  {
    id: "art",
    label: "Art",
    table: "art" as const,
    description: "Paintings and sculptures from Redd",
    // Academic painting from ACNH API
    spriteUrl: "https://raw.githubusercontent.com/alexislours/ACNHAPI/master/images/art/academic_painting.png",
  },
];

const ICON_BG_COLORS: Record<string, string> = {
  fish: "rgba(78, 173, 207, 0.12)",
  bugs: "rgba(123, 198, 126, 0.12)",
  sea: "rgba(232, 160, 191, 0.12)",
  fossils: "rgba(212, 184, 150, 0.15)",
  art: "rgba(242, 212, 119, 0.15)",
};

export default function MuseumPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const { donatedIds } = useMuseumStore();

  useEffect(() => {
    async function load() {
      const results: Record<string, number> = {};
      for (const cat of CATEGORIES) {
        results[cat.id] = await db.table(cat.table).count();
      }
      setCounts(results);
    }
    load();
  }, []);

  const totalItems = Object.values(counts).reduce((a, b) => a + b, 0);
  const totalDonated = CATEGORIES.reduce((sum, cat) => sum + (donatedIds[cat.id]?.length ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Museum</h1>
        <p className="text-text-secondary mt-1">
          Track your museum donations across all categories.
        </p>
      </div>

      <Card>
        <ProgressBar label="Total Museum Completion" value={totalDonated} max={totalItems} />
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => (
          <Link key={cat.id} href={`/museum/${cat.id}`}>
            <Card hoverable className="h-full">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="flex items-center justify-center rounded-xl shrink-0"
                  style={{
                    width: 56,
                    height: 56,
                    backgroundColor: ICON_BG_COLORS[cat.id],
                  }}
                >
                  <img
                    src={cat.spriteUrl}
                    alt={cat.label}
                    width={40}
                    height={40}
                    className="w-10 h-10 object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-text">{cat.label}</h3>
                  <p className="text-xs text-text-muted mt-0.5">{cat.description}</p>
                </div>
              </div>
              <ProgressBar
                value={donatedIds[cat.id]?.length ?? 0}
                max={counts[cat.id] ?? 0}
                showCount
              />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
