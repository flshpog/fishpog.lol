"use client";

import { Badge } from "@/components/ui/Badge";
import type { NormalizedVillager } from "@/types/data";
import { useVillagerStore } from "../store/villagerStore";

interface VillagerDetailProps {
  villager: NormalizedVillager;
  onClose: () => void;
}

export function VillagerDetail({ villager, onClose }: VillagerDetailProps) {
  const { islandVillagerIds, favoriteVillagerIds, addToIsland, removeFromIsland, toggleFavorite } =
    useVillagerStore();

  const isOnIsland = islandVillagerIds.includes(villager.id);
  const isFavorite = favoriteVillagerIds.includes(villager.id);
  const islandFull = islandVillagerIds.length >= 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative bg-bg-card rounded-2xl border border-border max-w-md w-full p-6 overflow-y-auto max-h-[90vh]"
        style={{ boxShadow: "var(--shadow-card-hover)" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-bg-hover transition-colors text-text-muted hover:text-text"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Villager info */}
        <div className="flex items-center gap-4 mb-5">
          {villager.imageUri ? (
            <img
              src={villager.imageUri}
              alt={villager.name}
              width={96}
              height={96}
              className="w-24 h-24 rounded-xl object-cover bg-bg-hover"
            />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-bg-hover flex items-center justify-center">
              <span className="text-2xl font-bold text-text-muted">{villager.name.charAt(0)}</span>
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-text">{villager.name}</h2>
            <p className="text-sm text-text-secondary">{villager.species}</p>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <Badge>{villager.personality}</Badge>
              {villager.hobby && <Badge>{villager.hobby}</Badge>}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-5">
          <DetailRow label="Gender" value={villager.gender} />
          <DetailRow label="Birthday" value={villager.birthday || "Unknown"} />
          <DetailRow label="Catchphrase" value={villager.catchphrase ? `"${villager.catchphrase}"` : "None"} />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isOnIsland ? (
            <button
              onClick={() => removeFromIsland(villager.id)}
              className="flex-1 h-9 rounded-lg text-sm font-medium border border-border text-text-secondary hover:bg-bg-hover transition-colors"
            >
              Remove from Island
            </button>
          ) : (
            <button
              onClick={() => addToIsland(villager.id)}
              disabled={islandFull}
              className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${
                islandFull
                  ? "bg-border text-text-muted cursor-not-allowed"
                  : "bg-primary-500 text-white hover:bg-primary-600"
              }`}
            >
              {islandFull ? "Island Full (10/10)" : "Add to Island"}
            </button>
          )}
          <button
            onClick={() => toggleFavorite(villager.id)}
            className={`h-9 px-4 rounded-lg text-sm font-medium border transition-colors ${
              isFavorite
                ? "bg-favorite/10 text-favorite border-favorite/30 hover:bg-favorite/20"
                : "border-border text-text-secondary hover:bg-bg-hover"
            }`}
          >
            {isFavorite ? "Unfavorite" : "Favorite"}
          </button>
        </div>

        {isOnIsland && (
          <p className="text-xs text-primary-500 font-medium text-center mt-2">
            Currently on your island ({islandVillagerIds.length}/10)
          </p>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-text-muted">{label}</span>
      <span className="text-text font-medium">{value}</span>
    </div>
  );
}
