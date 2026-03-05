"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useChecklistStore } from "../store/checklistStore";
import type { NormalizedVillager } from "@/types/data";

const CDN = "https://nh-cdn.catalogue.ac";
const SPRITE = {
  fossil: `${CDN}/FtrIcon/Fossil.png`,
  moneyTree: `${CDN}/GardeningIcon/PltMoney4.png`,
  bottle: `${CDN}/FtrIcon/DIYbook1.png`,
  turnip: `${CDN}/MenuIcon/Kabu.png`,
  rock: `${CDN}/MenuIcon/OreStone.png`,
};

interface DailyChecklistProps {
  villagers: NormalizedVillager[];
}

export function DailyChecklist({ villagers }: DailyChecklistProps) {
  const {
    ensureToday,
    talkedTo,
    toggleTalked,
    fossils,
    toggleFossil,
    moneyTree,
    toggleMoneyTree,
    recipeBottle,
    toggleRecipeBottle,
    rocks,
    toggleRock,
    turnipAM,
    turnipPM,
    setTurnipAM,
    setTurnipPM,
  } = useChecklistStore();

  useEffect(() => {
    ensureToday();
  }, [ensureToday]);

  const totalTasks =
    villagers.length + fossils.length + 1 + 1 + rocks.length;
  const completedTasks =
    talkedTo.length +
    fossils.filter(Boolean).length +
    (moneyTree ? 1 : 0) +
    (recipeBottle ? 1 : 0) +
    rocks.filter(Boolean).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const isSunday = new Date().getDay() === 0;

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-text">Daily Checklist</h2>
        <span className="text-xs font-medium text-primary-600">
          {completedTasks}/{totalTasks} done
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-bg-hover rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-5">
        {/* Talk to Residents */}
        {villagers.length > 0 && (
          <ChecklistSection title="Talk to Residents" count={talkedTo.length} total={villagers.length}>
            <div className="flex flex-wrap gap-3">
              {villagers.map((v) => {
                const done = talkedTo.includes(v.id);
                return (
                  <button
                    key={v.id}
                    onClick={() => toggleTalked(v.id)}
                    className="relative group flex flex-col items-center gap-1"
                    title={`${v.name} - ${done ? "Done" : "Tap to check off"}`}
                  >
                    <div className="relative">
                      {v.iconUri ? (
                        <img
                          src={v.iconUri}
                          alt={v.name}
                          width={48}
                          height={48}
                          className={`w-12 h-12 rounded-full object-cover border-2 transition-all duration-200 ${
                            done
                              ? "border-donated opacity-100"
                              : "border-border opacity-70 group-hover:opacity-100 group-hover:border-primary-300"
                          }`}
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                            done
                              ? "border-donated bg-donated/10"
                              : "border-border bg-bg-hover group-hover:border-primary-300"
                          }`}
                        >
                          <span className="text-sm font-bold text-text-muted">{v.name.charAt(0)}</span>
                        </div>
                      )}
                      <CheckDot checked={done} />
                    </div>
                    <span className={`text-[10px] font-medium transition-colors ${done ? "text-donated" : "text-text-secondary"}`}>
                      {v.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </ChecklistSection>
        )}

        {/* Turnips */}
        <ChecklistSection title="Turnips" subtitle={isSunday ? "Daisy Mae is here!" : undefined}>
          <div className="flex items-center gap-3">
            <img
              src={SPRITE.turnip}
              alt="Turnip"
              width={48}
              height={48}
              className="w-12 h-12 object-contain flex-shrink-0"
              loading="lazy"
            />
            {isSunday ? (
              <p className="text-xs text-text-muted">Buy turnips from Daisy Mae today!</p>
            ) : (
              <div className="flex gap-2 flex-1">
                <PriceInput
                  label="AM"
                  value={turnipAM}
                  onChange={setTurnipAM}
                />
                <PriceInput
                  label="PM"
                  value={turnipPM}
                  onChange={setTurnipPM}
                />
                <Link
                  href="/turnips"
                  className="self-end text-[10px] text-primary-500 hover:text-primary-600 font-medium pb-1 whitespace-nowrap"
                >
                  Calculator
                </Link>
              </div>
            )}
          </div>
        </ChecklistSection>

        {/* Fossils, Money Tree & Recipe Bottle */}
        <ChecklistSection
          title="Fossils, Money Tree & Bottle"
          count={fossils.filter(Boolean).length + (moneyTree ? 1 : 0) + (recipeBottle ? 1 : 0)}
          total={6}
        >
          <div className="flex flex-wrap gap-3">
            {fossils.map((done, i) => (
              <ChecklistCircle
                key={`fossil-${i}`}
                checked={done}
                onClick={() => toggleFossil(i)}
                label={`Fossil ${i + 1}`}
                spriteUrl={SPRITE.fossil}
              />
            ))}
            <ChecklistCircle
              checked={moneyTree}
              onClick={toggleMoneyTree}
              label="Money Tree"
              spriteUrl={SPRITE.moneyTree}
            />
            <ChecklistCircle
              checked={recipeBottle}
              onClick={toggleRecipeBottle}
              label="Bottle"
              spriteUrl={SPRITE.bottle}
            />
          </div>
        </ChecklistSection>

        {/* Hit Rocks */}
        <ChecklistSection title="Hit Rocks" count={rocks.filter(Boolean).length} total={6}>
          <div className="flex flex-wrap gap-3">
            {rocks.map((done, i) => (
              <ChecklistCircle
                key={`rock-${i}`}
                checked={done}
                onClick={() => toggleRock(i)}
                label={`Rock ${i + 1}`}
                spriteUrl={SPRITE.rock}
              />
            ))}
          </div>
        </ChecklistSection>
      </div>
    </Card>
  );
}

function ChecklistSection({
  title,
  subtitle,
  count,
  total,
  children,
}: {
  title: string;
  subtitle?: string;
  count?: number;
  total?: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        {count !== undefined && total !== undefined && (
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
            count === total ? "bg-donated/20 text-donated" : "bg-bg-hover text-text-muted"
          }`}>
            {count}/{total}
          </span>
        )}
        {subtitle && (
          <span className="text-[10px] text-primary-600 font-medium">{subtitle}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function CheckDot({ checked }: { checked: boolean }) {
  return (
    <div
      className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-bg-card flex items-center justify-center transition-all duration-200 ${
        checked ? "bg-donated" : "bg-bg-hover"
      }`}
    >
      {checked && (
        <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 6l3 3 5-5" />
        </svg>
      )}
    </div>
  );
}

function ChecklistCircle({
  checked,
  onClick,
  label,
  spriteUrl,
}: {
  checked: boolean;
  onClick: () => void;
  label: string;
  spriteUrl: string;
}) {
  return (
    <button
      onClick={onClick}
      className="relative group flex flex-col items-center gap-1"
      title={`${label} - ${checked ? "Done" : "Tap to check off"}`}
    >
      <div className="relative">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
            checked
              ? "bg-donated/20 ring-2 ring-donated"
              : "bg-bg-hover group-hover:bg-bg-hover/80"
          }`}
        >
          <img
            src={spriteUrl}
            alt={label}
            width={32}
            height={32}
            className={`w-8 h-8 object-contain transition-opacity duration-200 ${
              checked ? "opacity-100" : "opacity-60 group-hover:opacity-100"
            }`}
            loading="lazy"
          />
        </div>
        <CheckDot checked={checked} />
      </div>
      <span className={`text-[10px] font-medium transition-colors ${checked ? "text-donated" : "text-text-secondary"}`}>
        {label}
      </span>
    </button>
  );
}

function PriceInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium text-text-muted">{label}</span>
      <input
        type="number"
        min={0}
        max={999}
        placeholder="---"
        value={value ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? null : parseInt(v, 10));
        }}
        className="w-16 h-7 px-2 text-sm text-text bg-bg-hover border border-border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
      />
    </div>
  );
}
