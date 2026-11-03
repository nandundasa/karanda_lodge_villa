"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, BedDouble, CalendarDays, ChevronDown, MessageCircle, Users } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageHero from "../components/ui/PageHero";
import Reveal from "../components/ui/Reveal";
import RoomGallery from "./RoomGallery";
import AvailabilityCalendar from "./AvailabilityCalendar";
import { AMENITIES, ROOM_ORDER, TAGLINES, formatPrice, isRoomId, type RoomId } from "@/lib/content/rooms";
import { CONTACT } from "@/lib/content/site";

interface Room {
  _id?: string;
  id: string;
  name: string;
  description: string;
  price: number | string;
  images?: string[];
  cardImage?: string;
  guests?: string | number;
  capacity?: number;
  beds?: string | number;
  availability?: Record<string, boolean>;
}

type LoadState = "loading" | "ready" | "error";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [highlight, setHighlight] = useState<string | null>(null);

  // Load once, and refresh when the visitor comes back to the tab
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/rooms", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        setRooms(Array.isArray(data.rooms) ? data.rooms : []);
        setState(res.ok ? "ready" : "error");
      } catch {
        if (!cancelled) setState((s) => (s === "loading" ? "error" : s));
      }
    };
    load();
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const ordered = useMemo(
    () =>
      rooms
        .filter((r): r is Room & { id: RoomId } => isRoomId(r.id))
        .sort((a, b) => ROOM_ORDER.indexOf(a.id) - ROOM_ORDER.indexOf(b.id)),
    [rooms]
  );

  // The villa is unavailable whenever it, or either of its rooms, is booked
  const villaBooked = useMemo(() => {
    const combined: Record<string, boolean> = {};
    for (const r of rooms) {
      if (!isRoomId(r.id)) continue;
      for (const [date, b] of Object.entries(r.availability || {})) if (b) combined[date] = true;
    }
    return combined;
  }, [rooms]);

  // Deep links like /Rooms#villa: scroll below the navbar and glow the card
  useEffect(() => {
    if (state !== "ready") return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    const el = id && document.getElementById(id);
    if (!el) return;
    const t = setTimeout(() => {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 88, behavior: "smooth" });
      setHighlight(id);
      setTimeout(() => setHighlight(null), 2200);
    }, 150);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <>
      <Navbar />
      <main className="bg-ivory-50 font-sans">
        <PageHero
          image="/IMG_0923.webp"
          imageAlt="The villa's double-height living room"
          eyebrow="Rooms & villa"
          title={
            <>
              Rest easy, <span className="italic text-gradient-gold">surrounded by calm</span>
            </>
          }
          subtitle="Book the entire villa for complete privacy, or choose one of our two rooms. Every stay comes with free parking, air conditioning and hot water."
        >
          <div className="mt-8 flex flex-wrap gap-3">
            {ROOM_ORDER.map((id) => {
              const r = ordered.find((x) => x.id === id);
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  className="glass group inline-flex items-center gap-3 rounded-full py-2 pl-4 pr-2 text-sm transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:bg-white/20"
                >
                  <span className="font-medium">{r?.name ?? (id === "villa" ? "Villa" : id === "family-room" ? "Family Room" : "Double Room")}</span>
                  {r && (
                    <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs text-gold-100 lining-nums">
                      Rs.{formatPrice(r.price)}
                    </span>
                  )}
                  <ChevronDown className="size-4 text-white/60 transition-transform group-hover:translate-y-0.5" />
                </a>
              );
            })}
          </div>
        </PageHero>

        <div className="relative mx-auto max-w-7xl space-y-24 px-5 py-20 sm:px-8 sm:py-28 lg:space-y-32 lg:px-12">
          {state === "loading" &&
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="grid gap-10 lg:grid-cols-2">
                <div className="skeleton aspect-[4/3] rounded-4xl" />
                <div className="space-y-4 pt-6">
                  <div className="skeleton h-4 w-40 rounded" />
                  <div className="skeleton h-12 w-72 rounded-lg" />
                  <div className="skeleton h-20 w-full rounded-lg" />
                  <div className="skeleton h-32 w-full rounded-2xl" />
                </div>
              </div>
            ))}

          {state !== "loading" && ordered.length === 0 && (
            <div className="rounded-4xl border border-dashed border-sage-300 bg-white/60 px-6 py-20 text-center">
              <BedDouble className="mx-auto size-10 text-sage-300" />
              <p className="mt-4 font-display text-2xl text-forest-900">
                {state === "error" ? "We couldn't load the rooms just now" : "No rooms to show yet"}
              </p>
              <p className="mt-2 text-sage-500">Please try again shortly, or message us on WhatsApp.</p>
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-forest-900 px-5 text-sm font-semibold text-white"
              >
                <MessageCircle className="size-4" /> Chat on WhatsApp
              </a>
            </div>
          )}

          {ordered.map((room, i) => (
            <RoomShowcase
              key={room._id || room.id}
              room={room}
              reverse={i % 2 === 1}
              booked={room.id === "villa" ? villaBooked : room.availability || {}}
              highlighted={highlight === room.id}
            />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ------------------------------------------------------------------------ */

function RoomShowcase({
  room,
  reverse,
  booked,
  highlighted,
}: {
  room: Room & { id: RoomId };
  reverse: boolean;
  booked: Record<string, boolean>;
  highlighted: boolean;
}) {
  const [showCalendar, setShowCalendar] = useState(false);
  const isVilla = room.id === "villa";
  const images = room.images?.length ? room.images : room.cardImage ? [room.cardImage] : [];
  const guests = room.guests ?? room.capacity;
  const price = formatPrice(room.price);

  return (
    <article
      id={room.id}
      aria-labelledby={`${room.id}-title`}
      className={`relative scroll-mt-24 rounded-[2.5rem] transition-shadow duration-700 ${
        highlighted ? "shadow-[0_0_0_3px_rgb(16_185_115/0.5),0_30px_80px_-20px_rgb(16_185_115/0.45)]" : ""
      }`}
    >
      <div
        className={`grid items-start gap-10 *:min-w-0 lg:gap-16 ${
          reverse
            ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:[&>*:first-child]:order-2"
            : "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
        }`}
      >
        {/* gallery */}
        <Reveal amount={0.15} y={40}>
          <RoomGallery
            images={images}
            name={room.name}
            badge={
              isVilla ? (
                <span className="glass-dark inline-flex items-center gap-1.5 rounded-full bg-forest-950/65! px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold-200">
                  Signature stay
                </span>
              ) : undefined
            }
          />
        </Reveal>

        {/* details */}
        <div className="lg:sticky lg:top-24">
          <Reveal delay={0.05}>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">{TAGLINES[room.id]}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 id={`${room.id}-title`} className="mt-3 font-display text-4xl font-medium leading-tight text-forest-900 sm:text-5xl">
              {isVilla ? "The Entire Villa" : room.name}
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-4 text-base leading-relaxed text-sage-600 sm:text-lg">{room.description}</p>
          </Reveal>

          {/* key facts */}
          <Reveal delay={0.2}>
            <dl className="mt-7 grid grid-cols-[0.8fr_1.4fr_1.1fr] divide-x divide-sage-200 rounded-2xl bg-white py-4 shadow-soft ring-1 ring-forest-900/5 sm:grid-cols-3">
              <Fact icon={<Users className="size-4" />} label="Guests" value={guests ? String(guests).replace(/\s*guests?$/i, "") : "—"} />
              <Fact icon={<BedDouble className="size-4" />} label="Beds" value={room.beds ? String(room.beds) : "—"} />
              <div className="px-4 text-center">
                <dt className="text-[11px] uppercase tracking-[0.18em] text-sage-500">{isVilla ? "From" : "Per night"}</dt>
                <dd className="mt-1 font-display text-2xl font-semibold text-forest-900 lining-nums">{price ? `Rs.${price}` : "—"}</dd>
              </div>
            </dl>
          </Reveal>

          {/* amenities */}
          <Reveal delay={0.25}>
            <h3 className="mt-9 text-xs font-semibold uppercase tracking-[0.24em] text-sage-500">
              {isVilla ? "Villa features" : "Room features"}
            </h3>
            <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {AMENITIES[room.id].map(({ icon: Icon, label }, j) => (
                <motion.li
                  key={label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 + j * 0.035 }}
                  className="group flex items-center gap-3 rounded-2xl bg-white px-3 py-3 text-sm text-forest-800 shadow-soft ring-1 ring-forest-900/5 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:ring-leaf-400/40"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-leaf-50 text-leaf-700 transition-colors duration-300 group-hover:bg-leaf-500 group-hover:text-white">
                    <Icon className="size-4" />
                  </span>
                  {label}
                </motion.li>
              ))}
            </ul>
          </Reveal>

          {/* actions */}
          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href={`/Booking?stay=${room.id}`}
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-forest-900 px-6 text-sm font-semibold text-white shadow-soft transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-glow"
              >
                Book {isVilla ? "the villa" : "this room"}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <button
                onClick={() => setShowCalendar((s) => !s)}
                aria-expanded={showCalendar}
                aria-controls={`${room.id}-calendar`}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-forest-800 shadow-soft ring-1 ring-forest-900/10 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:ring-leaf-400/50"
              >
                <CalendarDays className="size-4 text-leaf-600" />
                {showCalendar ? "Hide availability" : "Check availability"}
                <ChevronDown className={`size-4 transition-transform duration-300 ${showCalendar ? "rotate-180" : ""}`} />
              </button>
            </div>
          </Reveal>

          <AnimatePresence initial={false}>
            {showCalendar && (
              <motion.div
                id={`${room.id}-calendar`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-5">
                  <AvailabilityCalendar booked={booked} />
                  {isVilla && (
                    <p className="mt-3 text-xs text-sage-500">
                      The villa shows as booked when either room inside it is taken.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </article>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="px-4 text-center">
      <dt className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-sage-500">
        <span className="text-leaf-600">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-forest-900">{value}</dd>
    </div>
  );
}
