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
  Images,
  MoonStar,
} from "lucide-react";
import StatCard from "@/app/components/ui/StatCard";
import StatusPill from "@/app/components/ui/StatusPill";
import { daysFrom, deriveStays, stayPhase, todayAtLodge, type RoomAvailability } from "@/lib/stays";
import { PHASE_DISPLAY, formatStayDate, relativeDay } from "@/lib/stayDisplay";
import IdViewerModal, { type IdMeta, type IdSide, type IdStay } from "./IdViewerModal";

type IdStatus = Record<string, Record<IdSide, IdMeta>>; // by stayId
type IdLoad = "loading" | "ready" | "error";

const ID_DISPLAY = {
  complete: { label: "Front & back", tone: "leaf" as const, icon: <CheckCircle2 className="size-3.5" /> },
  partial: { label: "1 of 2", tone: "gold" as const, icon: <CircleDashed className="size-3.5" /> },
  missing: { label: "Not uploaded", tone: "rose" as const, icon: <AlertCircle className="size-3.5" /> },
};

type Props = {
  rooms: (RoomAvailability & { price?: number | string })[];
  slidesCount: number;
  galleryCount: number;
  loading: boolean;
  onManageAvailability: () => void;
};

export default function AdminOverview({
  rooms,
  slidesCount,
  galleryCount,
  loading,
  onManageAvailability,
}: Props) {
  const today = todayAtLodge();
  const stays = useMemo(() => deriveStays(rooms, today), [rooms, today]);

  // Guest ID upload status (metadata only) from the manager bookings list,
  // which admins may read. Re-fetched whenever the set of stays changes.
  const [ids, setIds] = useState<IdStatus>({});
  const [idLoad, setIdLoad] = useState<IdLoad>("loading");
  const [viewing, setViewing] = useState<IdStay | null>(null);
  const stayKey = stays.map((s) => s.stayId).join("|");

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    fetch("/api/manager/bookings", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        const data: { bookings?: { stayId: string; idImages: Record<IdSide, IdMeta> }[] } = await res.json();
        if (cancelled) return;
        setIds(Object.fromEntries((data.bookings ?? []).map((b) => [b.stayId, b.idImages])));
        setIdLoad("ready");
      })
      .catch(() => !cancelled && setIdLoad("error"));
    return () => {
      cancelled = true;
    };
  }, [loading, stayKey]);

  const idState = (stayId: string) => {
    const m = ids[stayId];
    return m?.front && m?.back ? "complete" : m?.front || m?.back ? "partial" : "missing";
  };
  const withIds = stays.filter((s) => idState(s.stayId) !== "missing").length;

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

      {/* ---------- Upcoming stays table ---------- */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="overflow-hidden rounded-2xl border border-forest-900/5 bg-white shadow-soft"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sage-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-2xl font-semibold text-forest-900">Upcoming stays</h2>
            <p className="text-sm text-sage-500">
              From the booked dates in Room Availability
              {idLoad === "ready" && stays.length > 0 && (
                <>
                  {" · "}
                  <span className="lining-nums">
                    {withIds} of {stays.length}
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
              {!loading && stays.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-sage-500">
                    <BedDouble className="mx-auto mb-3 size-8 text-sage-300" />
                    No upcoming stays. Mark dates as booked in Room Availability.
                  </td>
                </tr>
              )}
              {!loading &&
                stays.map((s, i) => {
                  const phase = PHASE_DISPLAY[stayPhase(s, today)];
                  return (
                    <motion.tr
                      key={s.stayId}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + Math.min(i, 10) * 0.04 }}
                      className="transition-colors hover:bg-leaf-50/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 place-items-center rounded-lg bg-forest-50 text-forest-700">
                            <BedDouble className="size-4" />
                          </span>
                          <span className="font-medium text-forest-900">{s.roomName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-forest-900">
                          {formatStayDate(s.checkIn, { weekday: "short" })}
                        </p>
                        <p className="text-xs text-sage-500">{relativeDay(daysFrom(s.checkIn, today))}</p>
                      </td>
                      <td className="px-4 py-4 text-forest-800">
                        {formatStayDate(s.checkOut, { weekday: "short" })}
                      </td>
                      <td className="px-4 py-4 text-right font-mono tabular-nums text-forest-800">
                        {s.nights}
                      </td>
                      <td className="px-4 py-4">
                        <StatusPill tone={phase.tone} pulse={phase.pulse}>
                          {phase.label}
                        </StatusPill>
                      </td>
                      <td className="px-6 py-3">
                        {idLoad === "loading" ? (
                          <div className="skeleton h-7 w-40 rounded-full" />
                        ) : idLoad === "error" ? (
                          <span className="text-xs text-sage-400">Unavailable</span>
                        ) : (
                          (() => {
                            const st = idState(s.stayId);
                            const d = ID_DISPLAY[st];
                            return (
                              <div className="flex items-center gap-2">
                                <StatusPill tone={d.tone} icon={d.icon}>
                                  {d.label}
                                </StatusPill>
                                {st !== "missing" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setViewing({
                                        stayId: s.stayId,
                                        roomName: s.roomName,
                                        checkIn: s.checkIn,
                                        checkOut: s.checkOut,
                                        idImages: ids[s.stayId],
                                      })
                                    }
                                    className="group/view inline-flex h-8 items-center gap-1.5 rounded-full bg-forest-900 px-3 text-xs font-semibold text-white transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-glow"
                                  >
                                    <Eye className="size-3.5 transition-transform group-hover/view:scale-110" />
                                    View IDs
                                  </button>
                                )}
                              </div>
                            );
                          })()
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </motion.section>

      <IdViewerModal stay={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
