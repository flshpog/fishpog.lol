"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "@/lib/db/database";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useCollectionStore } from "@/modules/collections/store/collectionStore";

const CATEGORIES = [
  { id: "items", label: "Items", description: "Furniture, clothing, wallpaper, tools, photos, and more" },
  { id: "diy", label: "DIY Recipes", description: "Craftable recipes and materials" },
  { id: "songs", label: "K.K. Songs", description: "K.K. Slider's music collection" },
  { id: "reactions", label: "Reactions", description: "Emotes learned from villagers" },
];

export default function CollectionsPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const { collectedIds } = useCollectionStore();

  useEffect(() => {
    async function load() {
      const [items, diy, songs, reactions] = await Promise.all([
        db.items.count(),
        db.diyRecipes.count(),
        db.songs.count(),
        db.reactions.count(),
      ]);
      setCounts({ items, diy, songs, reactions });
    }
    load();
  }, []);

  const totalItems = Object.values(counts).reduce((a, b) => a + b, 0);
  const totalCollected = CATEGORIES.reduce((sum, cat) => sum + (collectedIds[cat.id]?.length ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Collections</h1>
        <p className="text-text-secondary mt-1">
          Track your item collections, DIY recipes, songs, and reactions.
        </p>
      </div>

      <Card>
        <ProgressBar label="Total Collection Progress" value={totalCollected} max={totalItems} />
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CATEGORIES.map((cat) => (
          <Link key={cat.id} href={`/collections/${cat.id}`}>
            <Card hoverable className="h-full">
              <h3 className="text-base font-semibold text-text">{cat.label}</h3>
              <p className="text-xs text-text-muted mt-1 mb-3">{cat.description}</p>
              <ProgressBar
                value={collectedIds[cat.id]?.length ?? 0}
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
