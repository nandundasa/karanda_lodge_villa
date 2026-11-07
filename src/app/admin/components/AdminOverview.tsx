"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowRight,
  BedDouble,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  DoorOpen,
  Eye,
  History,
  Images,
  MoonStar,
} from "lucide-react";
import StatCard from "@/app/components/ui/StatCard";
import StatusPill, { type PillTone } from "@/app/components/ui/StatusPill";
import { bySoonestCheckIn, daysFrom, deriveStays, stayPhase, todayAtLodge, type RoomAvailability, type Stay } from "@/lib/stays";
import { PHASE_DISPLAY, formatStayDate, relativeDay } from "@/lib/stayDisplay";
import IdViewerModal, { type IdMeta, type IdSide, type IdStay } from "./IdViewerModal";

type IdImages = Record<IdSide, IdMeta>;
type IdStatus = Record<string, IdImages>; // by stayId
type IdLoad = "loading" | "ready" | "error";
type View = "upcoming" | "past";
/** A stay as the bookings API lists it (upcoming or past). */
type ListedStay = Stay & { idImages: IdImages; removedFromCalendar?: boolean };

/** One table row: the stay plus what the Status column and date hints show. */
type Row = {
  stay: Stay;
  status: { label: string; tone: PillTone; pulse: boolean };
  checkInHint?: string;
  checkOutHint?: string;
  note?: string;
};

const ID_DISPLAY = {
  complete: { label: "Front & back", tone: "leaf" as const, icon: <CheckCircle2 className="size-3.5" /> },
  partial: { label: "1 of 2", tone: "gold" as const, icon: <CircleDashed className="size-3.5" /> },
  missing: { label: "Not uploaded", tone: "rose" as const, icon: <AlertCircle className="size-3.5" /> },
};

const VIEWS: { key: View; label: string; icon: typeof CalendarCheck2 }[] = [
  { key: "upcoming", label: "Upcoming stays", icon: CalendarCheck2 },
  { key: "past", label: "Past stays", icon: History },
];

function idState(m?: IdImages) {
  return m?.front && m?.back ? "complete" : m?.front || m?.back ? "partial" : "missing";
}

type Props = {
  rooms: (RoomAvailability & { price?: number | string })[];
  slidesCount: number;
  galleryCount: number;
  loading: boolean;
  onManageAvailability: () => void;
};

type PastState = { rooms: Props["rooms"]; load: IdLoad; stays: ListedStay[]; hasMore: boolean };

export default function AdminOverview({
  rooms,
  slidesCount,
  galleryCount,
  loading,
  onManageAvailability,
}: Props) {
  const today = todayAtLodge();
  const stays = useMemo(() => deriveStays(rooms, today), [rooms, today]);
  const [view, setView] = useState<View>("upcoming");
  const [viewing, setViewing] = useState<IdStay | null>(null);

  // Guest ID upload status (metadata only) from the manager bookings list,
  // which admins may read. Re-fetched whenever the set of stays changes.
  const [ids, setIds] = useState<IdStatus>({});
  const [idLoad, setIdLoad] = useState<IdLoad>("loading");
  // Upcoming stays whose nights were removed from the calendar after ID photos were uploaded
  const [removedUpcoming, setRemovedUpcoming] = useState<ListedStay[]>([]);
  const stayKey = stays.map((s) => s.stayId).join("|");

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    fetch("/api/manager/bookings", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        const data: { bookings?: ListedStay[] } = await res.json();
        if (cancelled) return;
        setIds(Object.fromEntries((data.bookings ?? []).map((b) => [b.stayId, b.idImages])));
        setRemovedUpcoming((data.bookings ?? []).filter((b) => b.removedFromCalendar));
        setIdLoad("ready");
      })
      .catch(() => !cancelled && setIdLoad("error"));
    return () => {
      cancelled = true;
    };
  }, [loading, stayKey]);

  // Booking history: fetched the first time "Past stays" is opened, and again
  // after the rooms change (e.g. availability was saved).
  const [past, setPast] = useState<PastState | null>(null);
  const pastStale = past?.rooms !== rooms;

  useEffect(() => {
    if (view !== "past" || loading || !pastStale) return;
    let cancelled = false;
    fetch("/api/manager/bookings?filter=past", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        const data: { bookings?: ListedStay[]; hasMore?: boolean } = await res.json();
        if (!cancelled) setPast({ rooms, load: "ready", stays: data.bookings ?? [], hasMore: !!data.hasMore });
      })
      .catch(() => !cancelled && setPast({ rooms, load: "error", stays: [], hasMore: false }));
    return () => {
      cancelled = true;
    };
  }, [view, loading, pastStale, rooms]);

  // Calendar stays plus removed-but-ID-on-file ones (the stat cards count calendar stays only)
  const calendarIds = new Set(stays.map((s) => s.stayId));
  const upcomingStays: (Stay & { removedFromCalendar?: boolean })[] = [
    ...stays,
    ...removedUpcoming.filter((s) => !calendarIds.has(s.stayId)),
  ].sort(bySoonestCheckIn);
  const withIds = upcomingStays.filter((s) => idState(ids[s.stayId]) !== "missing").length;
  const upcomingRows: Row[] = upcomingStays.map((s) => ({
    stay: s,
    status: PHASE_DISPLAY[stayPhase(s, today)],
    checkInHint: relativeDay(daysFrom(s.checkIn, today)),
    note: s.removedFromCalendar ? "Removed from calendar" : undefined,
  }));

  const pastStays = past?.stays ?? [];
  const pastReady = past?.load === "ready";
  const pastIds: IdStatus = Object.fromEntries(pastStays.map((s) => [s.stayId, s.idImages]));
  const pastWithIds = pastStays.filter((s) => idState(s.idImages) !== "missing").length;
  const pastRows: Row[] = pastStays.map((s) => ({
    stay: s,
    status: { label: "Checked out", tone: "sage", pulse: false },
    checkOutHint: relativeDay(daysFrom(s.checkOut, today)),
    note: s.removedFromCalendar ? "Removed from calendar" : undefined,
  }));

  const stats = useMemo(() => {
    const inHouse = stays.filter((s) => s.checkIn <= today && s.checkOut > today).length;
    const arrivingWeek = stays.filter((s) => {
      const d = daysFrom(s.checkIn, today);
      return d >= 0 && d <= 7;
    }).length;
    const month = today.slice(0, 7);
    // Villa nights count once (it also blocks the two rooms)
    const villa = rooms.find((r) => r.id === "villa");
    const villaNights = new Set(
      Object.entries(villa?.availability || {})
        .filter(([d, b]) => b && d.startsWith(month))
        .map(([d]) => d)
    );
    let nightsThisMonth = villaNights.size;
    for (const r of rooms) {
      if (r.id === "villa") continue;
      nightsThisMonth += Object.entries(r.availability || {}).filter(
        ([d, b]) => b && d.startsWith(month) && !villaNights.has(d)
      ).length;
    }
    return { inHouse, arrivingWeek, nightsThisMonth };
  }, [stays, rooms, today]);

  const monthName = new Date(`${today}T00:00:00Z`).toLocaleDateString("en-GB", {
    month: "long",
    timeZone: "UTC",
  });

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          loading={loading}
          icon={CalendarCheck2}
          tone="leaf"
          label="Upcoming stays"
          value={stays.length}
          hint={`${stats.arrivingWeek} arriving in the next 7 days`}
        />
        <StatCard
          index={1}
          loading={loading}
          icon={DoorOpen}
          tone="gold"
          label="Guests in house"
          value={stats.inHouse}
          hint={stats.inHouse ? "Stays in progress today" : "No one checked in"}
        />
        <StatCard
          index={2}
          loading={loading}
          icon={MoonStar}
          tone="forest"
          label="Nights booked"
          value={stats.nightsThisMonth}
          hint={`${monthName} · villa nights counted once`}
        />
        <StatCard
          index={3}
          loading={loading}
          icon={Images}
          tone="earth"
          label="Gallery photos"
          value={galleryCount}
          hint={`${slidesCount} homepage slide${slidesCount === 1 ? "" : "s"}`}
        />
      </div>

      {/* ---------- Stays table: Upcoming | Past ---------- */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="overflow-hidden rounded-2xl border border-forest-900/5 bg-white shadow-soft"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sage-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-2xl font-semibold text-forest-900">
              {view === "upcoming" ? "Upcoming stays" : "Past stays"}
            </h2>
            <p className="text-sm text-sage-500">
              {view === "upcoming" ? "From the booked dates in Room Availability" : "Most recent check-out first"}
              {(view === "upcoming" ? idLoad === "ready" && upcomingStays.length > 0 : pastReady && pastStays.length > 0) && (
                <>
                  {" · "}
                  <span className="lining-nums">
                    {view === "upcoming" ? withIds : pastWithIds} of{" "}
                    {view === "upcoming" ? upcomingStays.length : pastStays.length}
                  </span>{" "}
                  with guest ID on file
                </>
              )}
            </p>
          </div>
          <button
            onClick={onManageAvailability}
            className="group inline-flex items-center gap-2 rounded-full bg-forest-900 px-4 py-2 text-sm font-medium text-white transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-glow"
          >
            <CalendarDays className="size-4" />
            Manage availability
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="border-b border-sage-100 bg-sage-50/40 px-5 py-3 sm:px-6">
          <div
            role="tablist"
            aria-label="Which stays to show"
            className="inline-flex rounded-full bg-sage-100/80 p-1 ring-1 ring-forest-900/5"
          >
            {VIEWS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={view === key}
                onClick={() => setView(key)}
                className={`relative inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors ${
                  view === key ? "text-white" : "text-forest-700 hover:text-forest-900"
                }`}
              >
                {view === key && (
                  <motion.span
                    layoutId="overview-stays-view"
                    className="absolute inset-0 rounded-full bg-forest-900 shadow-soft"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                  />
                )}
                <Icon className="relative size-4" />
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {view === "upcoming" ? (
          <StaysTable
            key="upcoming"
            rows={upcomingRows}
            loading={loading}
            ids={ids}
            idLoad={idLoad}
            empty="No upcoming stays. Mark dates as booked in Room Availability."
            onView={setViewing}
          />
        ) : (
          <StaysTable
            key="past"
            rows={pastRows}
            loading={loading || !past || (pastStale && pastStays.length === 0)}
            ids={pastIds}
            idLoad={past?.load === "error" ? "error" : "ready"}
            empty={past?.load === "error" ? "Could not load past stays. Please try again." : "No past stays yet."}
            onView={setViewing}
          />
        )}
        {view === "past" && pastReady && past.hasMore && (
          <p className="border-t border-sage-100 px-6 py-3 text-center text-xs text-sage-500">
            Showing the <span className="lining-nums">{pastStays.length}</span> most recent stays.
          </p>
        )}
      </motion.section>

      <IdViewerModal stay={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}

/** The stays table, shared by the Upcoming and Past views. */
function StaysTable({
  rows,
  loading,
  ids,
  idLoad,
  empty,
  onView,
}: {
  rows: Row[];
  loading: boolean;
  ids: IdStatus;
  idLoad: IdLoad;
  empty: string;
  onView: (stay: IdStay) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead>
          <tr className="bg-sage-50/70 text-xs uppercase tracking-wider text-sage-500">
            <th scope="col" className="px-6 py-3 font-medium">Room</th>
            <th scope="col" className="px-4 py-3 font-medium">Check-in</th>
            <th scope="col" className="px-4 py-3 font-medium">Check-out</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Nights</th>
            <th scope="col" className="px-4 py-3 font-medium">Status</th>
            <th scope="col" className="px-6 py-3 font-medium">Guest ID</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sage-100">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 6 }).map((__, j) => (
                  <td key={j} className="px-6 py-4">
                    <div className="skeleton h-4 w-full max-w-28 rounded" />
                  </td>
                ))}
              </tr>
            ))}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-14 text-center text-sage-500">
                <BedDouble className="mx-auto mb-3 size-8 text-sage-300" />
                {empty}
              </td>
            </tr>
          )}
          {!loading &&
            rows.map(({ stay: s, status, checkInHint, checkOutHint, note }, i) => {
              const images = ids[s.stayId];
              const st = idState(images);
              const d = ID_DISPLAY[st];
              return (
                <motion.tr
                  key={s.stayId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + Math.min(i, 10) * 0.04 }}
                  className="transition-colors hover:bg-leaf-50/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-lg bg-forest-50 text-forest-700">
                        <BedDouble className="size-4" />
                      </span>
                      <span>
                        <span className="block font-medium text-forest-900">{s.roomName}</span>
                        {note && <span className="block text-xs text-sage-500">{note}</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-forest-900">{formatStayDate(s.checkIn, { weekday: "short" })}</p>
                    {checkInHint && <p className="text-xs text-sage-500">{checkInHint}</p>}
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-forest-800">{formatStayDate(s.checkOut, { weekday: "short" })}</p>
                    {checkOutHint && <p className="text-xs text-sage-500">{checkOutHint}</p>}
                  </td>
                  <td className="px-4 py-4 text-right font-mono tabular-nums text-forest-800">{s.nights}</td>
                  <td className="px-4 py-4">
                    <StatusPill tone={status.tone} pulse={status.pulse}>
                      {status.label}
                    </StatusPill>
                  </td>
                  <td className="px-6 py-3">
                    {idLoad === "loading" ? (
                      <div className="skeleton h-7 w-40 rounded-full" />
                    ) : idLoad === "error" ? (
                      <span className="text-xs text-sage-400">Unavailable</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <StatusPill tone={d.tone} icon={d.icon}>
                          {d.label}
                        </StatusPill>
                        {st !== "missing" && (
                          <button
                            type="button"
                            onClick={() =>
                              onView({
                                stayId: s.stayId,
                                roomName: s.roomName,
                                checkIn: s.checkIn,
                                checkOut: s.checkOut,
                                idImages: images,
                              })
                            }
                            className="group/view inline-flex h-8 items-center gap-1.5 rounded-full bg-forest-900 px-3 text-xs font-semibold text-white transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-glow"
                          >
                            <Eye className="size-3.5 transition-transform group-hover/view:scale-110" />
                            View IDs
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </motion.tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
