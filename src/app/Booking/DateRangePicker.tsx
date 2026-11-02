"use client";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { todayAtLodge } from "@/lib/stays";

export type Range = { checkIn?: string; checkOut?: string };

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const pad = (n: number) => String(n).padStart(2, "0");

export function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function nightsBetween(a: string, b: string) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

/**
 * Pick a check-in and check-out date. `booked` holds booked *nights*: a stay
 * may not include a booked night, but may check out on the morning of one.
 */
export default function DateRangePicker({
  booked,
  value,
  onChange,
  disabled = false,
}: {
  booked: Record<string, boolean>;
  value: Range;
  onChange: (r: Range) => void;
  disabled?: boolean;
}) {
  const today = todayAtLodge();
  const [ty, tm] = today.split("-").map(Number);
  const [start, setStart] = useState({ year: ty, month: tm - 1 });
  const [hover, setHover] = useState<string | null>(null);

  const isCurrent = start.year === ty && start.month === tm - 1;
  const shift = (d: number) =>
    setStart(({ year, month }) => {
      const m = month + d;
      return { year: year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });

  const nightFree = (d: string) => d >= today && !booked[d];

  // When picking check-out, the stay can't run past the next booked night
  const limit = useMemo(() => {
    if (!value.checkIn || value.checkOut) return null;
    for (let i = 1, d = addDays(value.checkIn, 1); i <= 366; i++, d = addDays(d, 1)) {
      if (booked[d]) return d; // may check out this morning, not later
    }
    return null;
  }, [value.checkIn, value.checkOut, booked]);

  const selectingOut = !!value.checkIn && !value.checkOut;

  const click = (d: string) => {
    if (disabled) return;
    if (selectingOut && d === value.checkIn) {
      onChange({}); // tap check-in again to start over
      return;
    }
    if (selectingOut && value.checkIn && d > value.checkIn && (!limit || d <= limit)) {
      onChange({ checkIn: value.checkIn, checkOut: d });
      setHover(null);
      return;
    }
    if (nightFree(d)) onChange({ checkIn: d, checkOut: undefined });
  };

  const end = value.checkOut ?? (selectingOut ? hover ?? undefined : undefined);

  const months = [0, 1].map((offset) => {
    const m = start.month + offset;
    return { year: start.year + Math.floor(m / 12), month: m % 12 };
  });

  return (
    <div className={`select-none ${disabled ? "pointer-events-none opacity-60" : ""}`}>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={isCurrent}
          aria-label="Previous month"
          className="grid size-10 place-items-center rounded-full text-forest-700 ring-1 ring-forest-900/10 transition-colors hover:bg-forest-50 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className="text-sm text-sage-600" aria-live="polite">
          {!value.checkIn ? "Select your check-in date" : selectingOut ? "Now select your check-out date" : "Dates selected. Click a date to change"}
        </p>
        <button
          type="button"
          onClick={() => shift(1)}
          aria-label="Next month"
          className="grid size-10 place-items-center rounded-full text-forest-700 ring-1 ring-forest-900/10 transition-colors hover:bg-forest-50"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {months.map(({ year, month }, mi) => {
          const first = new Date(Date.UTC(year, month, 1)).getUTCDay();
          const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
          const label = new Date(Date.UTC(year, month, 1)).toLocaleDateString("en-GB", {
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          });
          return (
            <div key={`${year}-${month}`} className={mi === 1 ? "hidden md:block" : ""}>
              <p className="mb-3 text-center font-display text-xl font-semibold text-forest-900 lining-nums">{label}</p>
              <div className="grid grid-cols-7 text-center text-[11px] font-medium uppercase tracking-wider text-sage-400">
                {WEEKDAYS.map((w) => (
                  <span key={w} className="py-1.5">
                    {w}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-1" onMouseLeave={() => setHover(null)}>
                {Array.from({ length: first }).map((_, i) => (
                  <span key={`pad-${i}`} />
                ))}
                {Array.from({ length: days }, (_, i) => {
                  const d = `${year}-${pad(month + 1)}-${pad(i + 1)}`;
                  const past = d < today;
                  const isBooked = !!booked[d];
                  const isIn = d === value.checkIn;
                  const isOut = d === end;
                  const inRange = !!value.checkIn && !!end && d > value.checkIn && d < end;
                  const canBeOut = selectingOut && !!value.checkIn && d > value.checkIn && (!limit || d <= limit);
                  // While choosing check-out, nights past the next booking are off-limits
                  const blockedForOut = selectingOut && !!limit && d > limit;
                  const enabled = isIn || (!past && (canBeOut || (!isBooked && !blockedForOut)));
                  const state = isIn || isOut ? "edge" : inRange ? "range" : past ? "past" : blockedForOut ? "blocked" : isBooked ? "booked" : "free";

                  return (
                    <div
                      key={d}
                      className={`relative flex justify-center ${
                        inRange ? "bg-leaf-100" : ""
                      } ${isIn && end ? "bg-gradient-to-r from-transparent from-50% to-leaf-100 to-50%" : ""} ${
                        isOut && value.checkIn ? "bg-gradient-to-l from-transparent from-50% to-leaf-100 to-50%" : ""
                      }`}
                    >
                      <button
                        type="button"
                        disabled={!enabled}
                        onClick={() => click(d)}
                        onMouseEnter={() => selectingOut && canBeOut && setHover(d)}
                        aria-label={`${d}${isBooked ? ", booked" : ""}${isIn ? ", check-in" : ""}${isOut ? ", check-out" : ""}`}
                        aria-pressed={isIn || isOut}
                        className={`relative grid size-10 place-items-center rounded-full text-sm tabular-nums transition-all duration-200 sm:size-11 ${
                          state === "edge"
                            ? "bg-forest-900 font-semibold text-white shadow-glow"
                            : state === "range"
                              ? "text-forest-900"
                              : state === "past" || state === "blocked"
                                ? "text-sage-300"
                                : state === "booked"
                                  ? canBeOut
                                    ? "text-rose-400 hover:bg-white hover:ring-2 hover:ring-forest-900"
                                    : "text-rose-300 line-through decoration-rose-300"
                                  : "font-medium text-forest-800 hover:bg-leaf-50 hover:ring-2 hover:ring-leaf-400"
                        } ${d === today && state !== "edge" ? "ring-1 ring-forest-900/40" : ""}`}
                      >
                        {i + 1}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-sage-600">
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded-full bg-forest-900" /> Your dates
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded-full bg-white ring-1 ring-sage-300" /> Available
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="text-rose-300 line-through">12</span> Booked
        </span>
      </div>
    </div>
  );
}
