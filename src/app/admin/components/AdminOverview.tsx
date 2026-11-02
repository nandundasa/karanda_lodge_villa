"use client";
import { useMemo } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  BedDouble,
  CalendarCheck2,
  CalendarDays,
  DoorOpen,
  Images,
  MoonStar,
} from "lucide-react";
import StatCard from "@/app/components/ui/StatCard";
import StatusPill from "@/app/components/ui/StatusPill";
import { daysFrom, deriveStays, stayPhase, todayAtLodge, type RoomAvailability } from "@/lib/stays";
import { PHASE_DISPLAY, formatStayDate, relativeDay } from "@/lib/stayDisplay";

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
            <p className="text-sm text-sage-500">From the booked dates in Room Availability</p>
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
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="bg-sage-50/70 text-xs uppercase tracking-wider text-sage-500">
                <th scope="col" className="px-6 py-3 font-medium">Room</th>
                <th scope="col" className="px-4 py-3 font-medium">Check-in</th>
                <th scope="col" className="px-4 py-3 font-medium">Check-out</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Nights</th>
                <th scope="col" className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100">
              {loading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="skeleton h-4 w-full max-w-28 rounded" />
                      </td>
                    ))}
                  </tr>
                ))}
              {!loading && stays.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-sage-500">
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
                      <td className="px-6 py-4">
                        <StatusPill tone={phase.tone} pulse={phase.pulse}>
                          {phase.label}
                        </StatusPill>
                      </td>
                    </motion.tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
}
