import type { PillTone } from "@/app/components/ui/StatusPill";
import type { StayPhase } from "@/lib/stays";

/** Shared labels/colors for a stay's phase (admin + manager). */
export const PHASE_DISPLAY: Record<StayPhase, { label: string; tone: PillTone; pulse: boolean }> = {
  "in-house": { label: "In house", tone: "leaf", pulse: true },
  arriving: { label: "Arriving today", tone: "gold", pulse: true },
  departing: { label: "Departing today", tone: "sky", pulse: false },
  upcoming: { label: "Upcoming", tone: "sage", pulse: false },
};

export function formatStayDate(date: string, opts: Intl.DateTimeFormatOptions = {}) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    ...opts,
  });
}

export function relativeDay(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  return days > 0 ? `In ${days} days` : `${-days} days ago`;
}
