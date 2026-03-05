"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { NormalizedVillager } from "@/types/data";

interface VillagerCardProps {
  villager: NormalizedVillager;
  isOnIsland: boolean;
  isFavorite: boolean;
  onClick: () => void;
}

export function VillagerCard({ villager, isOnIsland, isFavorite, onClick }: VillagerCardProps) {
  return (
    <Card
      hoverable
      onClick={onClick}
      className={`flex flex-col items-center text-center p-3 relative ${
        isOnIsland ? "ring-2 ring-primary-400" : ""
      }`}
    >
      {isFavorite && (
        <span className="absolute top-2 right-2 text-favorite">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </span>
      )}
      {villager.iconUri ? (
        <img
          src={villager.iconUri}
          alt={villager.name}
          width={64}
          height={64}
          className="w-16 h-16 rounded-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-bg-hover flex items-center justify-center">
          <span className="text-lg font-bold text-text-muted">{villager.name.charAt(0)}</span>
        </div>
      )}
      <span className="text-sm font-semibold text-text mt-2">{villager.name}</span>
      <span className="text-xs text-text-muted">{villager.species}</span>
      <div className="flex gap-1 mt-1.5 flex-wrap justify-center">
        <Badge>{villager.personality}</Badge>
        {isOnIsland && <Badge variant="donated">Island</Badge>}
      </div>
    </Card>
  );
}
