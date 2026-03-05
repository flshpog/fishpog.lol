"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/db/database";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useMysteryIslandStore } from "@/modules/mystery-islands/store/mysteryIslandStore";
import type { NormalizedMysteryIsland } from "@/types/data";

export default function MysteryIslandsPage() {
  const [islands, setIslands] = useState<NormalizedMysteryIsland[]>([]);
  const { visitedIslandIds, toggleVisited } = useMysteryIslandStore();

  useEffect(() => {
    db.mysteryIslands.toArray().then(setIslands);
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text">Mystery Islands</h1>
        <p className="text-text-secondary mt-1">
          Browse the mystery island types. Click to mark as visited.
        </p>
      </div>

      <Card>
        <ProgressBar label="Islands Discovered" value={visitedIslandIds.length} max={islands.length} />
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {islands.map((island) => {
          const visited = visitedIslandIds.includes(island.id);
          return (
            <Card
              key={island.id}
              className={`cursor-pointer transition-colors hover:bg-bg-hover ${
                visited ? "ring-2 ring-caught" : ""
              }`}
              onClick={() => toggleVisited(island.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-text">{island.name}</h3>
                <div className="flex items-center gap-1.5">
                  {visited && <Badge variant="collected">Visited</Badge>}
                  <Badge>{island.spawnRate}%</Badge>
                </div>
              </div>
              {island.imageUri && (
                <img
                  src={island.imageUri}
                  alt={`${island.name} map`}
                  className="w-full rounded-lg mb-3 bg-bg-hover"
                  loading="lazy"
                />
              )}
              <p className="text-sm text-text-secondary mb-3">{island.description}</p>
              <div className="space-y-1 text-xs text-text-muted">
                <p>Resources: {island.resources}</p>
                <p>Rocks: {island.rockCount}</p>
                <p>Native fruit: {island.nativeFruit ? "Yes" : "No"}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
