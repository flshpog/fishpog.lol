"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "@/lib/db/database";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useSettingsStore } from "@/store/settingsStore";
import { useVillagerStore } from "@/modules/villagers/store/villagerStore";
import { useMuseumStore } from "@/modules/museum/store/museumStore";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FilterBar, type FilterOption } from "@/components/ui/FilterBar";
import { DailyChecklist } from "./components/DailyChecklist";
import type {
  NormalizedFish,
  NormalizedBug,
  NormalizedSeaCreature,
  NormalizedEvent,
  NormalizedVillager,
} from "@/types/data";

interface CritterAvailable {
  id: string;
  name: string;
  type: "fish" | "bug" | "sea";
  iconUri: string;
  price?: number;
}

const CRITTER_TABS: FilterOption[] = [
  { label: "Fish", value: "fish" },
  { label: "Bugs", value: "bug" },
  { label: "Sea Creatures", value: "sea" },
];

export function DashboardPage() {
  const { month, hour } = useCurrentTime();
  const hemisphere = useSettingsStore((s) => s.hemisphere);
  const { islandVillagerIds } = useVillagerStore();
  const { caughtIds, donatedIds, markCaught, unmarkCaught, markDonated, unmarkDonated } =
    useMuseumStore();
  const [available, setAvailable] = useState<CritterAvailable[]>([]);
  const [events, setEvents] = useState<NormalizedEvent[]>([]);
  const [islandVillagers, setIslandVillagers] = useState<NormalizedVillager[]>([]);
  const [critterTab, setCritterTab] = useState("fish");
  const [loading, setLoading] = useState(true);

  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        const monthKey = hemisphere === "northern" ? "northern" : "southern";
        const [allFish, allBugs, allSea, allEvents, allVillagers] = await Promise.all([
          db.fish.toArray(),
          db.bugs.toArray(),
          db.seaCreatures.toArray(),
          db.events.toArray(),
          db.villagers.toArray(),
        ]);

        const availableNow: CritterAvailable[] = [];

        for (const f of allFish) {
          if (isAvailable(f, monthKey, month, hour)) {
            availableNow.push({ id: f.id, name: f.name, type: "fish", iconUri: f.iconUri, price: f.price });
          }
        }
        for (const b of allBugs) {
          if (isAvailable(b, monthKey, month, hour)) {
            availableNow.push({ id: b.id, name: b.name, type: "bug", iconUri: b.iconUri, price: b.price });
          }
        }
        for (const s of allSea) {
          if (isAvailable(s, monthKey, month, hour)) {
            availableNow.push({ id: s.id, name: s.name, type: "sea", iconUri: s.iconUri, price: s.price });
          }
        }

        setAvailable(availableNow);
        setEvents(allEvents.filter((e) => e.month.includes(month)));

        // Load island villager data
        if (islandVillagerIds.length > 0) {
          setIslandVillagers(
            allVillagers.filter((v) => islandVillagerIds.includes(v.id))
          );
        }
      } catch {
        // Dashboard data load failed
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [month, hour, hemisphere, islandVillagerIds]);

  const filteredCritters = available.filter((c) => c.type === critterTab);

  const toCategory = (type: string) => (type === "bug" ? "bugs" : type);

  const getStatus = (type: string, id: string) => {
    const cat = toCategory(type);
    if ((donatedIds[cat] ?? []).includes(id)) return "donated";
    if ((caughtIds[cat] ?? []).includes(id)) return "caught";
    return "none";
  };

  const toggleCaught = (type: string, id: string) => {
    const cat = toCategory(type);
    if ((caughtIds[cat] ?? []).includes(id)) {
      unmarkCaught(cat, id);
      unmarkDonated(cat, id);
    } else {
      markCaught(cat, id);
    }
  };

  const toggleDonated = (type: string, id: string) => {
    const cat = toCategory(type);
    if ((donatedIds[cat] ?? []).includes(id)) {
      unmarkDonated(cat, id);
    } else {
      markDonated(cat, id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-3 border-border border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Welcome to Your Horizon</h1>
        <p className="text-text-secondary mt-1">
          {dayName}, {dateStr}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Checklist */}
          <DailyChecklist villagers={islandVillagers} />

          {/* Available Right Now */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-text">Available Right Now</h2>
              <span className="text-xs text-text-muted">{hour}:00</span>
            </div>

            <FilterBar
              options={CRITTER_TABS.map((t) => ({
                ...t,
                label: `${t.label} (${available.filter((c) => c.type === t.value).length})`,
              }))}
              selected={critterTab}
              onSelect={setCritterTab}
            />

            {filteredCritters.length === 0 ? (
              <p className="text-sm text-text-muted mt-4">No critter data loaded yet.</p>
            ) : (
              <div className="mt-4">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {filteredCritters.map((critter) => {
                  const status = getStatus(critter.type, critter.id);
                  const ringClass =
                    status === "donated"
                      ? "ring-2 ring-donated"
                      : status === "caught"
                      ? "ring-2 ring-caught"
                      : "";

                  return (
                    <div
                      key={`${critter.type}-${critter.id}`}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl bg-bg-hover/50 border border-transparent hover:border-border transition-all duration-200 hover:shadow-sm cursor-pointer ${ringClass}`}
                      onClick={() => toggleCaught(critter.type, critter.id)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        toggleDonated(critter.type, critter.id);
                      }}
                    >
                      {critter.iconUri ? (
                        <img
                          src={critter.iconUri}
                          alt={critter.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-bg-hover flex items-center justify-center">
                          <span className="text-xs text-text-muted font-medium">
                            {critter.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="text-[10px] text-text-secondary text-center leading-tight line-clamp-2 w-full">
                        {critter.name}
                      </span>
                      {status !== "none" && (
                        <Badge
                          variant={status === "donated" ? "donated" : "collected"}
                          className="mt-0.5"
                        >
                          {status === "donated" ? "D" : "C"}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-text-muted mt-2">
                Click to toggle caught. Right-click to toggle donated.
              </p>
              </div>
            )}
          </Card>

          {/* Quick Access */}
          <div>
            <h2 className="text-base font-bold text-text mb-3">Quick Access</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <QuickLink href="/museum" title="Museum" desc="Track fish, bugs, fossils, art" />
              <QuickLink href="/collections" title="Collections" desc="DIY recipes, songs, items" />
              <QuickLink href="/turnips" title="Turnip Calculator" desc="Predict turnip prices" />
              <QuickLink href="/flowers" title="Flower Breeding" desc="Hybrid paths and genetics" />
              <QuickLink href="/mystery-islands" title="Mystery Islands" desc="18 island types" />
              <QuickLink href="/island-designer" title="Island Designer" desc="Plan your island layout" />
            </div>
          </div>
        </div>

        {/* Sidebar column */}
        <div className="space-y-6">
          {/* Events this month */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-text">Events This Month</h2>
              <Link
                href="/events"
                className="text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors"
              >
                View all
              </Link>
            </div>
            {events.length === 0 ? (
              <p className="text-sm text-text-muted">No events this month.</p>
            ) : (
              <ul className="space-y-3">
                {events.slice(0, 5).map((event) => (
                  <li key={event.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary-700">
                        {event.dates?.match(/\d+/)?.[0] ?? "?"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-text">{event.name}</span>
                      <span className="text-xs text-text-muted block">{event.dates}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* NPC Visitors */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-text">Visitor Tracker</h2>
              <Link
                href="/visitors"
                className="text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors"
              >
                Log visits
              </Link>
            </div>
            <p className="text-xs text-text-muted">
              Track your weekly visiting NPCs on the{" "}
              <Link href="/visitors" className="text-primary-500 underline">
                Visitors page
              </Link>
              .
            </p>
          </Card>

          {/* Weather */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-text">Weather</h2>
              <Link
                href="/weather"
                className="text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors"
              >
                Open tool
              </Link>
            </div>
            <p className="text-xs text-text-muted">
              Set your weather seed to predict patterns.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href}>
      <Card hoverable className="h-full">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        <p className="text-xs text-text-muted mt-1">{desc}</p>
      </Card>
    </Link>
  );
}

function isAvailable(
  critter: NormalizedFish | NormalizedBug | NormalizedSeaCreature,
  monthKey: "northern" | "southern",
  month: number,
  hour: number
): boolean {
  const months = critter.availability[monthKey];
  if (!months || !months.includes(month)) return false;

  if (!critter.time || critter.time.length === 0) return true;
  for (const range of critter.time) {
    if (range.start <= range.end) {
      if (hour >= range.start && hour < range.end) return true;
    } else {
      if (hour >= range.start || hour < range.end) return true;
    }
  }
  return false;
}
