"use client";

import Link from "next/link";
import { CritterGrid } from "@/modules/museum/components/CritterGrid";

const CATEGORY_CONFIG: Record<string, { tableName: string; showAvailability: boolean }> = {
  fish: { tableName: "fish", showAvailability: true },
  bugs: { tableName: "bugs", showAvailability: true },
  sea: { tableName: "seaCreatures", showAvailability: true },
  fossils: { tableName: "fossils", showAvailability: false },
  art: { tableName: "art", showAvailability: false },
};

interface MuseumCategoryClientProps {
  category: string;
  label: string;
}

export function MuseumCategoryClient({ category, label }: MuseumCategoryClientProps) {
  const config = CATEGORY_CONFIG[category];

  if (!config) {
    return <p className="text-text-muted">Unknown category.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/museum" className="text-primary-500 hover:underline text-sm">&larr; Museum</Link>
        <span className="text-text-muted text-sm">/</span>
        <h1 className="text-2xl font-bold text-text">{label}</h1>
      </div>

      <CritterGrid
        category={category}
        tableName={config.tableName}
        showAvailability={config.showAvailability}
      />
    </div>
  );
}
