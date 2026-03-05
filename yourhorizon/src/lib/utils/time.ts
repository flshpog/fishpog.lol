import type { Hemisphere, Month, Season } from "@/types/common";
import { DEFAULT_TIMEZONE } from "./constants";

/** Get the current month (1-12) in the user's timezone */
export function getCurrentMonth(timezone?: string): Month {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone ?? DEFAULT_TIMEZONE,
    month: "numeric",
  });
  return parseInt(formatter.format(now), 10) as Month;
}

/** Get the current hour (0-23) in the user's timezone */
export function getCurrentHour(timezone?: string): number {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone ?? DEFAULT_TIMEZONE,
    hour: "numeric",
    hour12: false,
  });
  return parseInt(formatter.format(now), 10);
}

/** Get the season for a given month and hemisphere */
export function getSeason(month: Month, hemisphere: Hemisphere): Season {
  const northern: Record<number, Season> = {
    12: "winter", 1: "winter", 2: "winter",
    3: "spring", 4: "spring", 5: "spring",
    6: "summer", 7: "summer", 8: "summer",
    9: "fall", 10: "fall", 11: "fall",
  };

  if (hemisphere === "northern") {
    return northern[month];
  }

  // Southern hemisphere is offset by 6 months
  const southernMap: Record<Season, Season> = {
    winter: "summer",
    spring: "fall",
    summer: "winter",
    fall: "spring",
  };
  return southernMap[northern[month]];
}

/** Auto-detect user timezone, falling back to default */
export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}
