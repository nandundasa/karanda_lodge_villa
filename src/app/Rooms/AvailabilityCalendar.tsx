"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { todayAtLodge } from "@/lib/stays";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const pad = (n: number) => String(n).padStart(2, "0");

/** Read-only month view of booked dates ({ "YYYY-MM-DD": true }). */
export default function AvailabilityCalendar({ booked }: { booked: Record<string, boolean> }) {
  const today = todayAtLodge();
  const [ty, tm] = today.split("-").map(Number);
  const [view, setView] = useState({ year: ty, month: tm - 1 }); // month: 0-11
  const [dir, setDir] = useState(1);

  const shift = (delta: number) => {
    setDir(delta);
    setView(({ year, month }) => {
      const m = month + delta;
      return { year: year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  };

  const isCurrentMonth = view.year === ty && view.month === tm - 1;
  const firstWeekday = new Date(Date.UTC(view.year, view.month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate();
  const monthLabel = new Date(Date.UTC(view.year, view.month, 1)).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  let freeCount = 0;
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const date = `${view.year}-${pad(view.month + 1)}-${pad(i + 1)}`;
    const past = date < today;
    const isBooked = booked[date] === true;
    if (!past && !isBooked) freeCount++;
    return { day: i + 1, date, past, isBooked, isToday: date === today };
  });

  return (
    <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-forest-900/5 sm:p-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => shift(-1)}
          disabled={isCurrentMonth}
          aria-label="Previous month"
          className="grid size-9 place-items-center rounded-full text-forest-700 transition-colors hover:bg-forest-50 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="text-center">
          <p className="font-display text-xl font-semibold text-forest-900 lining-nums">{monthLabel}</p>
          <p className="text-xs text-sage-500 lining-nums">
            {freeCount} night{freeCount === 1 ? "" : "s"} available
          </p>
        </div>
        <button
          onClick={() => shift(1)}
          aria-label="Next month"
          className="grid size-9 place-items-center rounded-full text-forest-700 transition-colors hover:bg-forest-50"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 text-center text-[11px] font-medium uppercase tracking-wider text-sage-400">
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false} custom={dir}>
        <motion.div
          key={`${view.year}-${view.month}`}
          custom={dir}
          initial={{ opacity: 0, x: dir * 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -24 }}
          transition={{ duration: 0.25 }}
          className="mt-1 grid grid-cols-7 gap-1"
        >
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <span key={`pad-${i}`} />
          ))}
          {days.map(({ day, date, past, isBooked, isToday }) => (
            <span
              key={date}
              title={past ? undefined : isBooked ? "Booked" : "Available"}
              className={`relative grid aspect-square place-items-center rounded-xl text-sm tabular-nums transition-colors ${
                past
                  ? "text-sage-300"
                  : isBooked
                    ? "bg-rose-50 text-rose-400 line-through decoration-rose-300"
                    : "bg-leaf-50 font-medium text-leaf-800"
              } ${isToday ? "ring-2 ring-forest-900 ring-offset-1" : ""}`}
            >
              {day}
            </span>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-sage-600">
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded bg-leaf-100 ring-1 ring-leaf-300" /> Available
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded bg-rose-50 ring-1 ring-rose-200" /> Booked
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded ring-2 ring-forest-900" /> Today
        </span>
      </div>
    </div>
  );
}
