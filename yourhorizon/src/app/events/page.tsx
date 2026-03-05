"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/db/database";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FilterBar, type FilterOption } from "@/components/ui/FilterBar";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useEventStore, type CustomEvent } from "@/modules/events/store/eventStore";
import type { NormalizedEvent } from "@/types/data";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const MONTH_FILTERS: FilterOption[] = [
  { label: "Current", value: "current" },
  ...MONTH_NAMES.map((m, i) => ({ label: m, value: String(i + 1) })),
];

const VIEW_OPTIONS: FilterOption[] = [
  { label: "List", value: "list" },
  { label: "Calendar", value: "calendar" },
];

export default function EventsPage() {
  const { month } = useCurrentTime();
  const [events, setEvents] = useState<NormalizedEvent[]>([]);
  const { viewMode, setViewMode, selectedMonth, setSelectedMonth, customEvents, addCustomEvent, removeCustomEvent } = useEventStore();
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    db.events.toArray().then(setEvents);
  }, []);

  const activeMonth = selectedMonth ?? month;
  const nextMonth = activeMonth === 12 ? 1 : activeMonth + 1;

  // Merge custom events into game events for unified display
  const customAsNormalized = useMemo<NormalizedEvent[]>(() => {
    return customEvents.map((ce) => {
      const m = parseInt(ce.date.split("-")[1], 10);
      return {
        id: ce.id,
        name: ce.name,
        month: [m],
        dates: ce.date,
        description: ce.description,
        isRecurring: false,
      };
    });
  }, [customEvents]);

  const allEvents = useMemo(() => [...events, ...customAsNormalized], [events, customAsNormalized]);

  const currentEvents = useMemo(() => allEvents.filter((e) => e.month.includes(activeMonth)), [allEvents, activeMonth]);
  const upcomingEvents = useMemo(() => allEvents.filter((e) => e.month.includes(nextMonth) && !e.month.includes(activeMonth)), [allEvents, activeMonth, nextMonth]);
  const otherEvents = useMemo(() => allEvents.filter((e) => !e.month.includes(activeMonth) && !e.month.includes(nextMonth)), [allEvents, activeMonth, nextMonth]);

  const calendarData = useMemo(() => {
    const byMonth: Record<number, NormalizedEvent[]> = {};
    for (let m = 1; m <= 12; m++) byMonth[m] = [];
    for (const e of allEvents) {
      for (const m of e.month) {
        byMonth[m]?.push(e);
      }
    }
    return byMonth;
  }, [allEvents]);

  const customEventIds = useMemo(() => new Set(customEvents.map((ce) => ce.id)), [customEvents]);

  function handleAddEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = (fd.get("name") as string).trim();
    const date = fd.get("date") as string;
    const description = (fd.get("description") as string).trim();
    if (!name || !date) return;
    addCustomEvent({ id: `custom-${Date.now()}`, name, date, description });
    form.reset();
    setShowAddForm(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text">Events</h1>
        <p className="text-text-secondary mt-1">
          Seasonal events and activities throughout the year.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <FilterBar options={VIEW_OPTIONS} selected={viewMode} onSelect={(v) => setViewMode(v as "list" | "calendar")} />
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
        >
          {showAddForm ? "Cancel" : "Add Event"}
        </button>
      </div>

      {showAddForm && (
        <Card>
          <form onSubmit={handleAddEvent} className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-muted">Name</label>
              <input
                name="name"
                required
                placeholder="Birthday, tourney..."
                className="h-8 px-2 text-sm bg-bg-hover border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-muted">Date</label>
              <input
                name="date"
                type="date"
                required
                className="h-8 px-2 text-sm bg-bg-hover border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
              <label className="text-xs font-medium text-text-muted">Description</label>
              <input
                name="description"
                placeholder="Optional"
                className="h-8 px-2 text-sm bg-bg-hover border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <button
              type="submit"
              className="h-8 px-4 text-sm font-medium rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              Save
            </button>
          </form>
        </Card>
      )}

      {viewMode === "list" && (
        <FilterBar
          options={MONTH_FILTERS}
          selected={selectedMonth ? String(selectedMonth) : "current"}
          onSelect={(v) => setSelectedMonth(v === "current" ? null : Number(v))}
        />
      )}

      {viewMode === "calendar" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
            const isCurrentMonth = m === month;
            const monthEvents = calendarData[m] ?? [];
            return (
              <Card key={m} className={isCurrentMonth ? "border-l-4 border-l-primary-500" : ""}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-text">{MONTH_NAMES[m - 1]}</h3>
                  {isCurrentMonth && <Badge variant="donated">Now</Badge>}
                  {monthEvents.length > 0 && (
                    <span className="text-xs text-text-muted">{monthEvents.length}</span>
                  )}
                </div>
                {monthEvents.length > 0 ? (
                  <ul className="space-y-1">
                    {monthEvents.map((e) => (
                      <li key={e.id} className="text-xs text-text-secondary">
                        <span className="font-medium">{e.name}</span>
                        {e.dates && <span className="text-text-muted ml-1">({e.dates})</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-text-muted">No events</p>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          {currentEvents.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-text mb-3">
                {selectedMonth ? `${MONTH_NAMES[activeMonth - 1]} Events` : "Happening Now"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isCustom={customEventIds.has(event.id)}
                    onRemove={removeCustomEvent}
                    accent
                    badge="Active"
                  />
                ))}
              </div>
            </section>
          )}

          {upcomingEvents.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-text mb-3">Coming Up Next</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isCustom={customEventIds.has(event.id)}
                    onRemove={removeCustomEvent}
                    badge="Upcoming"
                  />
                ))}
              </div>
            </section>
          )}

          {otherEvents.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-text mb-3">All Events</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {otherEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isCustom={customEventIds.has(event.id)}
                    onRemove={removeCustomEvent}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function EventCard({
  event,
  isCustom,
  onRemove,
  accent,
  badge,
}: {
  event: NormalizedEvent;
  isCustom: boolean;
  onRemove: (id: string) => void;
  accent?: boolean;
  badge?: string;
}) {
  return (
    <Card className={accent ? "border-l-4 border-l-primary-500" : ""}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-text">{event.name}</h3>
        <div className="flex items-center gap-1.5 shrink-0">
          {isCustom && <Badge variant="collected">Custom</Badge>}
          {badge && <Badge variant={badge === "Active" ? "donated" : undefined}>{badge}</Badge>}
        </div>
      </div>
      <p className="text-xs text-text-muted mt-1">{event.dates}</p>
      {event.description && (
        <p className="text-sm text-text-secondary mt-2">{event.description}</p>
      )}
      {event.isRecurring && (
        <p className="text-xs text-primary-500 mt-1">Recurring annually</p>
      )}
      {isCustom && (
        <button
          onClick={() => onRemove(event.id)}
          className="mt-2 text-xs text-red-500 hover:underline"
        >
          Remove
        </button>
      )}
    </Card>
  );
}
