"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Info, Lock } from "lucide-react";
import { Panel, SaveBar, useToast } from "./ui";
import { ROOM_ORDER, isRoomId, type RoomId } from "@/lib/content/rooms";
import { todayAtLodge } from "@/lib/stays";
import { VILLA_ID, VILLA_ROOMS, groupConsecutive, ownDates, resolveBlocks, type RoomDoc } from "@/lib/blocks";

type Room = RoomDoc & { name: string };
/** Own booked nights per room (villa nights are NOT copied into the rooms) */
type Draft = Record<string, Set<string>>;

type Props = {
  rooms: Room[];
  /** Complete set of own booked nights for each changed room */
  onSave: (bookedDates: Record<string, string[]>) => Promise<boolean>;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

// Alternating tones so back-to-back stays are visibly separate
const STAY_TONES = [
  { cell: "bg-rose-50 text-rose-700 ring-rose-200 hover:ring-rose-400", dot: "bg-rose-400" },
  { cell: "bg-orange-50 text-orange-700 ring-orange-200 hover:ring-orange-400", dot: "bg-orange-400" },
];

/**
 * Click nights to book or free them, then save. Nights added in one save
 * become ONE new stay; nights added in a later save become a separate stay,
 * even if they touch an existing one (back-to-back guests).
 */
export default function AvailabilityPanel({ rooms, onSave }: Props) {
  const toast = useToast();
  const ordered = useMemo(
    () =>
      rooms
        .filter((r) => isRoomId(r.id))
        .sort((a, b) => ROOM_ORDER.indexOf(a.id as RoomId) - ROOM_ORDER.indexOf(b.id as RoomId)),
    [rooms]
  );
  const blocks = useMemo(() => resolveBlocks(rooms), [rooms]);
  const initial: Draft = useMemo(
    () => Object.fromEntries(Object.entries(blocks).map(([id, b]) => [id, ownDates(b)])),
    [blocks]
  );

  const [draft, setDraft] = useState<Draft>(initial);
  const [roomId, setRoomId] = useState(ordered[0]?.id ?? VILLA_ID);
  const today = todayAtLodge();
  const [ty, tm] = today.split("-").map(Number);
  const [view, setView] = useState({ year: ty, month: tm - 1 });
  const [dir, setDir] = useState(1);
  const [saving, setSaving] = useState(false);

  const own = (id: string, src: Draft = draft) => src[id] ?? new Set<string>();

  // Changed (room, night) pairs vs. what's saved
  const changes = useMemo(() => {
    const out: { id: string; date: string }[] = [];
    for (const id of new Set([...Object.keys(draft), ...Object.keys(initial)])) {
      const a = draft[id] ?? new Set<string>();
      const b = initial[id] ?? new Set<string>();
      for (const d of a) if (!b.has(d)) out.push({ id, date: d });
      for (const d of b) if (!a.has(d)) out.push({ id, date: d });
    }
    return out;
  }, [draft, initial]);

  // Saved stays for the selected room: night -> { stay index, first night? }
  const stayIndex = useMemo(() => {
    const map = new Map<string, { idx: number; start: boolean; nights: number }>();
    (blocks[roomId] ?? []).forEach((b, idx) =>
      b.dates.forEach((d, j) => map.set(d, { idx, start: j === 0, nights: b.dates.length }))
    );
    return map;
  }, [blocks, roomId]);

  /** Why a night can't be toggled in the current room, if it can't */
  const lockReason = (d: string): string | null => {
    if (roomId === VILLA_ID) {
      const roomBooked = VILLA_ROOMS.filter((r) => own(r).has(d));
      return roomBooked.length && !own(VILLA_ID).has(d) ? "Room booked" : null;
    }
    return own(VILLA_ID).has(d) ? "Villa" : null;
  };

  const toggle = (d: string) => {
    if (lockReason(d)) return;
    setDraft((prev) => {
      const next = new Set(prev[roomId] ?? []);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return { ...prev, [roomId]: next };
    });
  };

  const shift = (delta: number) => {
    setDir(delta);
    setView(({ year, month }) => {
      const m = month + delta;
      return { year: year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const touched = [...new Set(changes.map((c) => c.id))];
      const payload = Object.fromEntries(touched.map((id) => [id, [...own(id)].sort()]));
      if (await onSave(payload)) toast(`Availability saved for ${touched.length} room${touched.length === 1 ? "" : "s"}.`);
    } finally {
      setSaving(false);
    }
  };

  const first = new Date(Date.UTC(view.year, view.month, 1)).getUTCDay();
  const days = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate();
  const label = new Date(Date.UTC(view.year, view.month, 1)).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const monthKey = `${view.year}-${pad(view.month + 1)}`;
  const monthDates = Array.from({ length: days }, (_, i) => `${monthKey}-${pad(i + 1)}`);
  const ownHere = own(roomId);
  const savedHere = own(roomId, initial);
  const bookedThisMonth = monthDates.filter((d) => d >= today && (ownHere.has(d) || lockReason(d) === "Villa")).length;

  // Stays touching this month: saved ones (still present) + new runs from this draft
  const monthStays = [
    ...(blocks[roomId] ?? [])
      .map((b, idx) => ({ idx, dates: b.dates.filter((d) => ownHere.has(d)), isNew: false }))
      .filter((s) => s.dates.length && s.dates.some((d) => d.startsWith(monthKey))),
    ...groupConsecutive([...ownHere].filter((d) => !savedHere.has(d)))
      .filter((run) => run.some((d) => d.startsWith(monthKey)))
      .map((dates) => ({ idx: -1, dates, isNew: true })),
  ].sort((a, b) => a.dates[0].localeCompare(b.dates[0]));

  return (
    <Panel
      title="Room availability"
      description="Click nights to book or free them, then save. Nights you add in one save become one stay; nights added in a later save become a separate stay, even if they're back-to-back."
    >
      {/* room switcher */}
      <div role="tablist" aria-label="Room" className="inline-flex flex-wrap gap-1 rounded-full bg-sage-50 p-1 ring-1 ring-sage-200/70">
        {ordered.map((r) => {
          const active = r.id === roomId;
          const pendingCount = changes.filter((c) => c.id === r.id).length;
          return (
            <button
              key={r.id}
              role="tab"
              aria-selected={active}
              onClick={() => setRoomId(r.id)}
              className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${active ? "text-white" : "text-sage-600 hover:text-forest-900"}`}
            >
              {active && (
                <motion.span
                  layoutId="avail-room"
                  className="absolute inset-0 rounded-full bg-forest-900 shadow-soft"
                  transition={{ type: "spring", stiffness: 450, damping: 36 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                {r.name}
                {pendingCount > 0 && (
                  <span
                    className={`grid size-5 place-items-center rounded-full text-[10px] font-semibold lining-nums ${active ? "bg-gold-300 text-forest-950" : "bg-gold-200 text-gold-700"}`}
                  >
                    {pendingCount}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-2xl bg-leaf-50 px-4 py-3 text-sm text-leaf-800 ring-1 ring-leaf-600/10">
        <Info className="mt-0.5 size-4 shrink-0" />
        {roomId === VILLA_ID
          ? "Booking the villa blocks the Family Room and Double Room for those nights. Nights a room is already booked can't be added to the villa."
          : "Nights booked as part of the whole villa are locked here. Change them on the Villa tab."}
      </p>

      {/* month header */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          onClick={() => shift(-1)}
          aria-label="Previous month"
          className="grid size-10 place-items-center rounded-full text-forest-700 ring-1 ring-forest-900/10 transition-colors hover:bg-forest-50"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="text-center">
          <p className="font-display text-2xl font-semibold text-forest-900 lining-nums">{label}</p>
          <p className="text-xs text-sage-500 lining-nums">
            {bookedThisMonth} upcoming night{bookedThisMonth === 1 ? "" : "s"} booked
          </p>
        </div>
        <button
          onClick={() => shift(1)}
          aria-label="Next month"
          className="grid size-10 place-items-center rounded-full text-forest-700 ring-1 ring-forest-900/10 transition-colors hover:bg-forest-50"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* calendar */}
      <div className="mt-5 grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium uppercase tracking-wider text-sage-400 sm:gap-2">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false} custom={dir}>
        <motion.div
          key={`${roomId}-${monthKey}`}
          initial={{ opacity: 0, x: dir * 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -24 }}
          transition={{ duration: 0.22 }}
          className="mt-2 grid grid-cols-7 gap-1.5 sm:gap-2"
        >
          {Array.from({ length: first }).map((_, i) => (
            <span key={`pad-${i}`} />
          ))}
          {monthDates.map((d, i) => {
            const past = d < today;
            const lock = lockReason(d);
            const booked = ownHere.has(d);
            const saved = stayIndex.get(d);
            const isNew = booked && !savedHere.has(d);
            const removed = !booked && savedHere.has(d);
            const tone = saved ? STAY_TONES[saved.idx % 2] : STAY_TONES[0];
            const caption = past
              ? "Past"
              : lock
                ? lock
                : isNew
                  ? "New stay"
                  : booked && saved?.start
                    ? "Check-in"
                    : booked
                      ? "Booked"
                      : "Free";
            return (
              <motion.button
                key={d}
                type="button"
                disabled={past || !!lock}
                onClick={() => toggle(d)}
                whileTap={{ scale: 0.92 }}
                aria-pressed={booked}
                aria-label={`${d}: ${lock ? `locked (${lock})` : booked ? (isNew ? "new stay, unsaved" : "booked") : removed ? "freed, unsaved" : "available"}`}
                title={lock === "Villa" ? "Booked as part of the whole villa" : lock ? "A room inside the villa is booked this night" : undefined}
                className={`relative flex aspect-square flex-col items-start justify-between rounded-xl p-1.5 text-left ring-1 transition-all duration-200 sm:aspect-[5/4] sm:rounded-2xl sm:p-2.5 ${
                  past
                    ? "cursor-not-allowed bg-sage-50 text-sage-300 ring-transparent"
                    : lock
                      ? "cursor-not-allowed bg-forest-50 text-forest-700/70 ring-forest-900/10 [background-image:repeating-linear-gradient(135deg,transparent_0_6px,rgb(23_63_47/0.05)_6px_12px)]"
                      : isNew
                        ? "border-2 border-dashed border-gold-400 bg-gold-100/70 text-gold-700 ring-transparent hover:border-gold-500"
                        : booked
                          ? `${tone.cell} hover:ring-2`
                          : "bg-leaf-50/70 text-forest-800 ring-leaf-200/70 hover:ring-2 hover:ring-leaf-500"
                } ${d === today ? "outline-2 outline-offset-2 outline-forest-900" : ""}`}
              >
                <span className="flex w-full items-center justify-between">
                  <span className="text-sm font-semibold tabular-nums sm:text-base">{i + 1}</span>
                  {lock && !past && <Lock className="hidden size-3 opacity-60 sm:block" />}
                </span>
                <span className="hidden text-[10px] font-medium uppercase tracking-wider sm:block">{caption}</span>
                {booked && saved?.start && !isNew && !past && (
                  <span className={`absolute left-0 top-2 h-4 w-1 rounded-r-full sm:top-2.5 sm:h-5 ${tone.dot}`} />
                )}
                {(isNew || removed) && (
                  <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-gold-400 ring-2 ring-white" title="Unsaved" />
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* stays this month */}
      {monthStays.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-sage-500">Stays this month</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {monthStays.map((s) => {
              const tone = s.isNew ? null : STAY_TONES[s.idx % 2];
              const checkOutDay = new Date(`${s.dates[s.dates.length - 1]}T00:00:00Z`);
              checkOutDay.setUTCDate(checkOutDay.getUTCDate() + 1);
              return (
                <li
                  key={(s.isNew ? "new-" : "stay-") + s.dates[0]}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ring-1 ${
                    s.isNew ? "bg-gold-100/70 text-gold-700 ring-gold-300" : "bg-white text-forest-800 ring-forest-900/10"
                  }`}
                >
                  <span className={`size-2 rounded-full ${tone ? tone.dot : "bg-gold-400"}`} />
                  <span className="font-medium lining-nums">
                    {fmt(s.dates[0])} → {fmt(checkOutDay.toISOString().slice(0, 10))}
                  </span>
                  <span className="text-sage-500 lining-nums">
                    {s.dates.length} night{s.dates.length === 1 ? "" : "s"}
                    {s.isNew ? " · new, unsaved" : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-sage-600">
        <span className="inline-flex items-center gap-2"><span className="size-3 rounded bg-leaf-100 ring-1 ring-leaf-300" /> Available</span>
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded bg-rose-50 ring-1 ring-rose-300" />
          <span className="-ml-1 size-3 rounded bg-orange-50 ring-1 ring-orange-300" /> Booked (each colour run is one stay)
        </span>
        <span className="inline-flex items-center gap-2"><span className="size-3 rounded border border-dashed border-gold-400 bg-gold-100" /> New stay (unsaved)</span>
        <span className="inline-flex items-center gap-2"><span className="size-3 rounded bg-forest-50 ring-1 ring-forest-900/10" /> Locked</span>
      </div>

      <SaveBar
        show={changes.length > 0}
        saving={saving}
        onSave={save}
        onDiscard={() => setDraft(initial)}
        message={`${changes.length} unsaved change${changes.length === 1 ? "" : "s"}`}
      />
    </Panel>
  );
}
