"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Panel, SaveBar, useToast } from "./ui";
import { ROOM_ORDER, isRoomId, type RoomId } from "@/lib/content/rooms";
import { todayAtLodge } from "@/lib/stays";

type Room = { id: string; name: string; availability?: Record<string, boolean> };
type Draft = Record<string, Record<string, boolean>>;

type Props = {
  rooms: Room[];
  onSave: (availability: Draft) => Promise<boolean>;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pad = (n: number) => String(n).padStart(2, "0");
const VILLA_GROUP = ["villa", "double-room", "family-room"];

/** Click days to mark them booked/available. Booking the villa books both rooms. */
export default function AvailabilityPanel({ rooms, onSave }: Props) {
  const toast = useToast();
  const ordered = useMemo(
    () => rooms.filter((r) => isRoomId(r.id)).sort((a, b) => ROOM_ORDER.indexOf(a.id as RoomId) - ROOM_ORDER.indexOf(b.id as RoomId)),
    [rooms]
  );
  const initial: Draft = useMemo(() => Object.fromEntries(rooms.map((r) => [r.id, { ...(r.availability || {}) }])), [rooms]);

  const [draft, setDraft] = useState<Draft>(initial);
  const [roomId, setRoomId] = useState(ordered[0]?.id ?? "villa");
  const today = todayAtLodge();
  const [ty, tm] = today.split("-").map(Number);
  const [view, setView] = useState({ year: ty, month: tm - 1 });
  const [dir, setDir] = useState(1);
  const [saving, setSaving] = useState(false);

  const isBooked = (id: string, d: string, src: Draft = draft) => src[id]?.[d] === true;

  // Changed (room, date) pairs vs. what's saved
  const changes = useMemo(() => {
    const out: { id: string; date: string }[] = [];
    for (const id of Object.keys(draft)) {
      const dates = new Set([...Object.keys(draft[id] || {}), ...Object.keys(initial[id] || {})]);
      for (const d of dates) if (isBooked(id, d) !== isBooked(id, d, initial)) out.push({ id, date: d });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- isBooked is a pure helper over draft/initial
  }, [draft, initial]);
  const changedHere = new Set(changes.filter((c) => c.id === roomId).map((c) => c.date));

  const toggle = (d: string) => {
    const next = !isBooked(roomId, d);
    setDraft((prev) => {
      const out = { ...prev };
      const targets = roomId === "villa" ? VILLA_GROUP : [roomId];
      for (const id of targets) out[id] = { ...(out[id] || {}), [d]: next };
      return out;
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
      const touched = new Set(changes.map((c) => c.id));
      const payload = Object.fromEntries([...touched].map((id) => [id, draft[id]]));
      if (await onSave(payload)) toast(`Availability saved for ${touched.size} room${touched.size === 1 ? "" : "s"}.`);
    } finally {
      setSaving(false);
    }
  };

  const first = new Date(Date.UTC(view.year, view.month, 1)).getUTCDay();
  const days = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate();
  const label = new Date(Date.UTC(view.year, view.month, 1)).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  const monthDates = Array.from({ length: days }, (_, i) => `${view.year}-${pad(view.month + 1)}-${pad(i + 1)}`);
  const bookedThisMonth = monthDates.filter((d) => d >= today && isBooked(roomId, d)).length;

  return (
    <Panel
      title="Room availability"
      description="Click a day to mark it booked or available, then save. Booked nights feed the Rooms, Booking and Manager pages."
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
              {active && <motion.span layoutId="avail-room" className="absolute inset-0 rounded-full bg-forest-900 shadow-soft" transition={{ type: "spring", stiffness: 450, damping: 36 }} />}
              <span className="relative flex items-center gap-2">
                {r.name}
                {pendingCount > 0 && (
                  <span className={`grid size-5 place-items-center rounded-full text-[10px] font-semibold lining-nums ${active ? "bg-gold-300 text-forest-950" : "bg-gold-200 text-gold-700"}`}>
                    {pendingCount}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {roomId === "villa" && (
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-leaf-50 px-4 py-3 text-sm text-leaf-800 ring-1 ring-leaf-600/10">
          <Info className="mt-0.5 size-4 shrink-0" />
          Booking the villa also books the Family Room and Double Room for those nights.
        </p>
      )}

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
          key={`${roomId}-${view.year}-${view.month}`}
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
            const booked = isBooked(roomId, d);
            const changed = changedHere.has(d);
            return (
              <motion.button
                key={d}
                type="button"
                disabled={past}
                onClick={() => toggle(d)}
                whileTap={{ scale: 0.92 }}
                aria-pressed={booked}
                aria-label={`${d}: ${booked ? "booked" : "available"}${changed ? " (unsaved)" : ""}`}
                className={`relative flex aspect-square flex-col items-start justify-between rounded-xl p-1.5 text-left transition-all duration-200 sm:aspect-[5/4] sm:rounded-2xl sm:p-2.5 ${
                  past
                    ? "cursor-not-allowed bg-sage-50 text-sage-300"
                    : booked
                      ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:ring-2 hover:ring-rose-400"
                      : "bg-leaf-50/70 text-forest-800 ring-1 ring-leaf-200/70 hover:ring-2 hover:ring-leaf-500"
                } ${d === today ? "outline-2 outline-offset-2 outline-forest-900" : ""}`}
              >
                <span className="text-sm font-semibold tabular-nums sm:text-base">{i + 1}</span>
                <span className="hidden text-[10px] font-medium uppercase tracking-wider sm:block">
                  {past ? "Past" : booked ? "Booked" : "Free"}
                </span>
                {changed && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-gold-400 ring-2 ring-white" title="Unsaved" />}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-sage-600">
        <span className="inline-flex items-center gap-2"><span className="size-3 rounded bg-leaf-100 ring-1 ring-leaf-300" /> Available</span>
        <span className="inline-flex items-center gap-2"><span className="size-3 rounded bg-rose-50 ring-1 ring-rose-300" /> Booked</span>
        <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-gold-400" /> Unsaved change</span>
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
