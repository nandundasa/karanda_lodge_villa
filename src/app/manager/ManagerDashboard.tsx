"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  BedDouble,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  LogOut,
  MoonStar,
  RefreshCw,
} from "lucide-react";
import StatusPill from "@/app/components/ui/StatusPill";
import { daysFrom, stayPhase, todayAtLodge, type StayPhase } from "@/lib/stays";
import { PHASE_DISPLAY, formatStayDate, relativeDay } from "@/lib/stayDisplay";
import IdUploadSheet, { type ImageMeta, type Side } from "./IdUploadSheet";

type ManagerBooking = {
  stayId: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  idImages: Record<Side, ImageMeta>;
};

type IdState = "complete" | "partial" | "missing";
type Filter = "all" | "needs-id" | "today" | "upcoming";

const idState = (b: ManagerBooking): IdState =>
  b.idImages.front && b.idImages.back ? "complete" : b.idImages.front || b.idImages.back ? "partial" : "missing";

const ID_DISPLAY: Record<IdState, { label: string; tone: "leaf" | "gold" | "rose"; icon: React.ReactNode }> = {
  complete: { label: "ID complete", tone: "leaf", icon: <CheckCircle2 className="size-3.5" /> },
  partial: { label: "1 of 2 photos", tone: "gold", icon: <CircleDashed className="size-3.5" /> },
  missing: { label: "ID needed", tone: "rose", icon: <AlertCircle className="size-3.5" /> },
};

// Left accent bar colour per phase
const PHASE_ACCENT: Record<StayPhase, string> = {
  "in-house": "bg-leaf-500",
  arriving: "bg-gold-400",
  departing: "bg-sky-400",
  upcoming: "bg-sage-300",
};

export default function ManagerDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<ManagerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [active, setActive] = useState<ManagerBooking | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const today = todayAtLodge();

  const toLogin = useCallback(() => router.replace("/manager/login"), [router]);

  const loadBookings = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/manager/bookings", { cache: "no-store" });
      if (res.status === 401) return toLogin();
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load bookings");
      setBookings(data.bookings);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toLogin]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const logout = async () => {
    await fetch("/api/manager/logout", { method: "POST" });
    router.replace("/manager/login");
    router.refresh();
  };

  const enriched = useMemo(
    () => bookings.map((b) => ({ ...b, phase: stayPhase(b, today), id: idState(b) })),
    [bookings, today]
  );

  const counts = useMemo(
    () => ({
      all: enriched.length,
      "needs-id": enriched.filter((b) => b.id !== "complete").length,
      today: enriched.filter((b) => b.phase !== "upcoming").length,
      upcoming: enriched.filter((b) => b.phase === "upcoming").length,
    }),
    [enriched]
  );

  const visible = enriched.filter((b) =>
    filter === "all"
      ? true
      : filter === "needs-id"
        ? b.id !== "complete"
        : filter === "today"
          ? b.phase !== "upcoming"
          : b.phase === "upcoming"
  );

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "needs-id", label: "Needs ID" },
    { key: "today", label: "Today" },
    { key: "upcoming", label: "Upcoming" },
  ];

  return (
    <div className="min-h-svh bg-sage-50 font-sans text-forest-950">
      {/* ---------- Top bar ---------- */}
      <header className="glass-light sticky top-0 z-30">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4 sm:px-6">
          <Image src="/logo.png" alt="" width={32} height={32} />
          <div className="flex-1 leading-tight">
            <p className="font-display text-lg font-semibold text-forest-900">Karanda Lodge</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-sage-500">Manager</p>
          </div>
          <button
            onClick={loadBookings}
            aria-label="Refresh bookings"
            className="grid size-10 place-items-center rounded-full text-forest-700 transition-colors hover:bg-forest-50"
          >
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={logout}
            className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-forest-700 transition-colors hover:bg-rose-50 hover:text-rose-700"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6">
        {/* ---------- Greeting + summary ---------- */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-forest-900 p-5 text-white shadow-lift sm:p-6"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-leaf-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-10 size-48 rounded-full bg-gold-400/15 blur-3xl" />
          <p className="relative text-sm text-forest-200">
            {new Date(`${today}T00:00:00Z`).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              timeZone: "UTC",
            })}
          </p>
          <h1 className="relative mt-1 font-display text-3xl font-semibold">Guest check-ins</h1>
          <div className="relative mt-5 grid grid-cols-3 gap-2">
            {[
              { label: "Bookings", value: counts.all },
              { label: "Needs ID", value: counts["needs-id"], warn: counts["needs-id"] > 0 },
              { label: "Today", value: counts.today },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/10 px-3 py-3 ring-1 ring-white/10">
                <p className={`font-display text-3xl font-semibold leading-none lining-nums tabular-nums ${s.warn ? "text-gold-300" : ""}`}>
                  {loading ? "–" : s.value}
                </p>
                <p className="mt-1 text-xs text-forest-200">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ---------- Filters ---------- */}
        <div className="sticky top-16 z-20 -mx-4 mt-6 bg-sage-50/85 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="flex gap-1 overflow-x-auto rounded-full bg-white p-1 shadow-soft ring-1 ring-forest-900/5" role="tablist">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                role="tab"
                aria-selected={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={`relative flex-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  filter === f.key ? "text-white" : "text-sage-600 hover:text-forest-900"
                }`}
              >
                {filter === f.key && (
                  <motion.span
                    layoutId="mgr-filter"
                    className="absolute inset-0 rounded-full bg-forest-900"
                    transition={{ type: "spring", stiffness: 450, damping: 36 }}
                  />
                )}
                <span className="relative">
                  {f.label}
                  <span className={`ml-1.5 text-xs ${filter === f.key ? "text-forest-200" : "text-sage-400"}`}>
                    {counts[f.key]}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ---------- List ---------- */}
        {error && (
          <p role="alert" className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-600/15">
            {error}
          </p>
        )}

        <ul className="mt-3 space-y-3">
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="h-28 rounded-2xl bg-white p-4 shadow-soft">
                <div className="skeleton h-5 w-32 rounded" />
                <div className="skeleton mt-3 h-4 w-48 rounded" />
                <div className="skeleton mt-4 h-6 w-40 rounded-full" />
              </li>
            ))}

          <AnimatePresence initial={false} mode="popLayout">
            {!loading &&
              visible.map((b, i) => {
                const phase = PHASE_DISPLAY[b.phase];
                const id = ID_DISPLAY[b.id];
                const until = daysFrom(b.checkIn, today);
                return (
                  <motion.li
                    key={b.stayId}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 8) * 0.05 } }}
                    exit={{ opacity: 0, scale: 0.97 }}
                  >
                    <button
                      onClick={() => setActive(b)}
                      className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl bg-white p-4 pl-5 text-left shadow-soft ring-1 ring-forest-900/5 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-lift hover:ring-leaf-500/30 active:scale-[0.99]"
                    >
                      <span className={`absolute inset-y-0 left-0 w-1.5 ${PHASE_ACCENT[b.phase]}`} />
                      <span className="hidden size-12 shrink-0 place-items-center rounded-xl bg-forest-50 text-forest-700 transition-colors group-hover:bg-leaf-50 group-hover:text-leaf-700 sm:grid">
                        <BedDouble className="size-6" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <h3 className="font-display text-xl font-semibold text-forest-900">{b.roomName}</h3>
                          <StatusPill tone={phase.tone} pulse={phase.pulse}>
                            {phase.label}
                          </StatusPill>
                        </div>
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-sage-600">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarRange className="size-4" />
                            {formatStayDate(b.checkIn, { weekday: "short" })} → {formatStayDate(b.checkOut, { weekday: "short" })}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MoonStar className="size-4" />
                            {b.nights} night{b.nights === 1 ? "" : "s"}
                          </span>
                          {b.phase === "upcoming" && <span className="text-sage-400">{relativeDay(until)}</span>}
                        </p>
                        <div className="mt-3">
                          <StatusPill tone={id.tone} icon={id.icon}>
                            {id.label}
                          </StatusPill>
                        </div>
                      </div>
                      <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-leaf-700">
                        <span className="hidden sm:inline">{b.id === "complete" ? "View" : "Add ID"}</span>
                        <ChevronRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </button>
                  </motion.li>
                );
              })}
          </AnimatePresence>
        </ul>

        {!loading && !error && visible.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-3xl border border-dashed border-sage-300 bg-white/60 px-6 py-12 text-center"
          >
            <CheckCircle2 className="mx-auto size-10 text-leaf-500" />
            <p className="mt-3 font-display text-xl font-semibold text-forest-900">
              {filter === "needs-id" ? "All IDs collected" : "Nothing here"}
            </p>
            <p className="mt-1 text-sm text-sage-500">
              {filter === "all" ? "No current or upcoming bookings." : "Try another filter."}
            </p>
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {active && (
          <IdUploadSheet
            key={active.stayId}
            booking={active}
            onClose={() => setActive(null)}
            onUnauthorized={toLogin}
            onUploaded={async () => {
              await loadBookings();
              setActive(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
