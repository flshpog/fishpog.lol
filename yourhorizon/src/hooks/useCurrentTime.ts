"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { getCurrentMonth, getCurrentHour } from "@/lib/utils/time";
import type { Month } from "@/types/common";

interface CurrentTime {
  month: Month;
  hour: number;
}

/**
 * Returns the current month and hour, updating every minute.
 * Uses the user's configured timezone.
 */
export function useCurrentTime(): CurrentTime {
  const timezone = useSettingsStore((s) => s.timezone);

  const [time, setTime] = useState<CurrentTime>(() => ({
    month: getCurrentMonth(timezone),
    hour: getCurrentHour(timezone),
  }));

  useEffect(() => {
    const update = () => {
      setTime({
        month: getCurrentMonth(timezone),
        hour: getCurrentHour(timezone),
      });
    };

    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [timezone]);

  return time;
}
