"use client";
import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowRight,
  BedDouble,
  CalendarCheck2,
  CalendarDays,
  Check,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Minus,
  MoonStar,
  Phone,
  Plus,
  RefreshCw,
  ShieldCheck,
  User,
  Users,
  X,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageHero from "../components/ui/PageHero";
import Reveal from "../components/ui/Reveal";
import DateRangePicker, { addDays, nightsBetween, type Range } from "./DateRangePicker";
import { ROOM_ORDER, formatPrice, isRoomId, type RoomId } from "@/lib/content/rooms";
import { CONTACT } from "@/lib/content/site";

type Room = { id: string; name: string; price?: number | string; availability?: Record<string, boolean> };
type LoadState = "loading" | "ready" | "error";
type SubmitState = "idle" | "opening" | "sent";

const STAY_INFO: Record<RoomId, { label: string; image: string; maxGuests: number; capacity: string }> = {
  villa: { label: "The Entire Villa", image: "/IMG_0922.webp", maxGuests: 9, capacity: "Up to 9 guests" },
  "family-room": { label: "Family Room", image: "/IMG_9527.webp", maxGuests: 5, capacity: "Up to 5 guests" },
  "double-room": { label: "Double Room", image: "/IMG_2255.webp", maxGuests: 2, capacity: "Up to 2 guests" },
};

const fmt = (d: string, opts: Intl.DateTimeFormatOptions = {}) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    ...opts,
  });

/** "7000-8000" → [7000, 8000]; 6000 → [6000, 6000] */
function priceRange(price: Room["price"]): [number, number] | null {
  const nums = String(price ?? "")
    .split("-")
    .map((p) => Number(p.replace(/[^\d.]/g, "")))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (!nums.length) return null;
  return [Math.min(...nums), Math.max(...nums)];
}

/** ?stay=… from the URL, read without a setState-in-effect (null on the server) */
const noSubscribe = () => () => {};
const readStayParam = () => new URLSearchParams(window.location.search).get("stay");

export default function BookingPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [load, setLoad] = useState<LoadState>("loading");
  const [reloadKey, setReloadKey] = useState(0);

  const stayParam = useSyncExternalStore(noSubscribe, readStayParam, () => null);
  const [pickedStay, setStay] = useState<RoomId | null>(null);
  const stay: RoomId = pickedStay ?? (stayParam && isRoomId(stayParam) ? stayParam : "villa");
  const [range, setRange] = useState<Range>({});
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [touched, setTouched] = useState(false);
  const [submit, setSubmit] = useState<SubmitState>("idle");
  const [waUrl, setWaUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/rooms", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        setRooms(Array.isArray(data.rooms) ? data.rooms : []);
        setLoad(res.ok ? "ready" : "error");
      })
      .catch(() => !cancelled && setLoad("error"));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Booked nights per stay: a room is blocked when the villa is booked, and
  // the villa is blocked when either room is.
  const bookedFor = useMemo(() => {
    const nights = (id: string) =>
      Object.entries(rooms.find((r) => r.id === id)?.availability || {})
        .filter(([, b]) => b === true)
        .map(([d]) => d);
    const toSet = (...lists: string[][]) => Object.fromEntries(lists.flat().map((d) => [d, true]));
    return {
      villa: toSet(nights("villa"), nights("family-room"), nights("double-room")),
      "family-room": toSet(nights("family-room"), nights("villa")),
      "double-room": toSet(nights("double-room"), nights("villa")),
    } as Record<RoomId, Record<string, boolean>>;
  }, [rooms]);

  const info = STAY_INFO[stay];
  const room = rooms.find((r) => r.id === stay);
  const nights = range.checkIn && range.checkOut ? nightsBetween(range.checkIn, range.checkOut) : 0;
  const pr = priceRange(room?.price);
  const total = pr && nights ? (pr[0] === pr[1] ? `Rs.${(pr[0] * nights).toLocaleString("en-US")}` : `Rs.${(pr[0] * nights).toLocaleString("en-US")}–${(pr[1] * nights).toLocaleString("en-US")}`) : null;

  // Changing stay: clamp guests and drop dates that clash with its bookings
  const chooseStay = (id: RoomId) => {
    setStay(id);
    setGuests((g) => Math.min(g, STAY_INFO[id].maxGuests));
    if (range.checkIn) {
      const b = bookedFor[id];
      const stayNights = range.checkOut ? nightsBetween(range.checkIn, range.checkOut) : 1;
      const clash = Array.from({ length: stayNights }).some((_, i) => b[addDays(range.checkIn!, i)]);
      if (clash) setRange({});
    }
    setSubmit("idle");
  };

  const errors = {
    dates: !range.checkIn || !range.checkOut ? "Choose your check-in and check-out dates" : "",
    name: name.trim().length < 2 ? "Please enter your name" : "",
    phone: phone.replace(/\D/g, "").length < 7 ? "Please enter a phone or WhatsApp number" : "",
  };
  const valid = !errors.dates && !errors.name && !errors.phone;

  const message = () =>
    [
      "Hello Karanda Lodge! I'd like to request a booking:",
      "",
      `• Stay: ${info.label}`,
      `• Check-in: ${fmt(range.checkIn!, { year: "numeric" })}`,
      `• Check-out: ${fmt(range.checkOut!, { year: "numeric" })} (${nights} night${nights === 1 ? "" : "s"})`,
      `• Guests: ${guests}`,
      `• Name: ${name.trim()}`,
      `• Phone: ${phone.trim()}`,
      notes.trim() ? `• Requests: ${notes.trim()}` : "",
      total ? `\nEstimated total: ${total}` : "",
      "",
      "Could you please confirm availability? Thank you!",
    ]
      .filter((l, i, a) => l !== "" || a[i - 1] !== "")
      .join("\n");

  const send = () => {
    setTouched(true);
    if (!valid) {
      document.querySelector<HTMLElement>("[data-error='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const url = `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message())}`;
    setWaUrl(url);
    setSubmit("opening");
    // Open synchronously in the click handler so pop-up blockers allow it
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => setSubmit("sent"), 1200);
  };

  const reset = () => {
    setRange({});
    setNotes("");
    setTouched(false);
    setSubmit("idle");
  };

  return (
    <>
      <Navbar />
      <main className="bg-ivory-50 font-sans">
        <PageHero
          image="/IMG_9539.webp"
          imageAlt="A bright, freshly made room at Karanda Lodge"
          eyebrow="Booking"
          title={
            <>
              Reserve your <span className="italic text-gradient-gold">peaceful escape</span>
            </>
          }
          subtitle="Choose your stay and dates, and we'll confirm everything with you personally on WhatsApp. No payment needed to request."
        />

        <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="grid gap-8 *:min-w-0 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10">
            {/* ---------------- Form ---------------- */}
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="space-y-6"
            >
              {/* 1. Stay */}
              <Step n={1} title="Choose your stay" icon={<BedDouble className="size-5" />}>
                <div role="radiogroup" aria-label="Stay" className="grid gap-3 sm:grid-cols-3">
                  {ROOM_ORDER.map((id) => {
                    const r = rooms.find((x) => x.id === id);
                    const selected = id === stay;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => chooseStay(id)}
                        className={`group relative flex overflow-hidden rounded-2xl text-left ring-1 transition-all duration-300 ease-premium sm:block ${
                          selected
                            ? "shadow-glow ring-2 ring-leaf-500"
                            : "ring-forest-900/10 hover:-translate-y-0.5 hover:shadow-soft hover:ring-leaf-400/50"
                        }`}
                      >
                        <span className="relative block w-28 shrink-0 overflow-hidden sm:aspect-[16/10] sm:w-auto">
                          <Image
                            src={STAY_INFO[id].image}
                            alt=""
                            fill
                            sizes="(min-width: 640px) 240px, 100vw"
                            className="object-cover transition-transform duration-700 ease-premium group-hover:scale-105"
                          />
                          <span className="absolute inset-0 bg-gradient-to-t from-forest-950/70 to-transparent" />
                          <span
                            className={`absolute right-2.5 top-2.5 grid size-6 place-items-center rounded-full transition-all duration-300 ${
                              selected ? "scale-100 bg-leaf-500 text-forest-950" : "scale-90 bg-white/30 text-transparent ring-1 ring-white/60"
                            }`}
                          >
                            <Check className="size-3.5" strokeWidth={3} />
                          </span>
                          <span className="absolute bottom-2.5 left-3 hidden text-xs font-medium text-white/90 sm:block">{STAY_INFO[id].capacity}</span>
                        </span>
                        <span className="flex flex-1 flex-col justify-center bg-white px-3.5 py-3">
                          <span className="block font-display text-lg font-semibold leading-tight text-forest-900">
                            {STAY_INFO[id].label}
                          </span>
                          <span className="mt-0.5 block text-xs text-sage-500 sm:hidden">{STAY_INFO[id].capacity}</span>
                          <span className="mt-0.5 block text-sm text-sage-600 lining-nums">
                            {load === "loading" ? (
                              <span className="skeleton inline-block h-4 w-24 rounded align-middle" />
                            ) : r?.price ? (
                              <>
                                {id === "villa" ? "From " : ""}Rs.{formatPrice(r.price)} <span className="text-sage-400">/ night</span>
                              </>
                            ) : (
                              "Price on request"
                            )}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {stay === "villa" && (
                  <p className="mt-4 rounded-2xl bg-leaf-50 px-4 py-3 text-sm text-leaf-800 ring-1 ring-leaf-600/10">
                    The villa includes both rooms and all common areas, reserved just for you. It&apos;s unavailable on
                    nights when either room is already booked.
                  </p>
                )}
              </Step>

              {/* 2. Dates */}
              <Step
                n={2}
                title="Pick your dates"
                icon={<CalendarDays className="size-5" />}
                error={touched ? errors.dates : ""}
                aside={
                  range.checkIn && (
                    <button
                      type="button"
                      onClick={() => setRange({})}
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-sage-600 transition-colors hover:bg-sage-100 hover:text-forest-900"
                    >
                      <X className="size-3.5" /> Clear dates
                    </button>
                  )
                }
              >
                <div className="mb-5 grid grid-cols-2 gap-3">
                  <DateField label="Check-in" value={range.checkIn} active={!range.checkIn} />
                  <DateField label="Check-out" value={range.checkOut} active={!!range.checkIn && !range.checkOut} />
                </div>

                {load === "loading" && (
                  <div className="grid gap-8 md:grid-cols-2" aria-busy="true" aria-label="Loading availability">
                    {[0, 1].map((i) => (
                      <div key={i} className={i ? "hidden md:block" : ""}>
                        <div className="skeleton mx-auto mb-4 h-6 w-36 rounded" />
                        <div className="grid grid-cols-7 gap-2">
                          {Array.from({ length: 35 }).map((_, j) => (
                            <div key={j} className="skeleton aspect-square rounded-full" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {load === "error" && (
                  <div className="flex flex-col items-center gap-3 rounded-2xl bg-rose-50 px-5 py-8 text-center text-sm text-rose-700 ring-1 ring-rose-600/15">
                    <AlertCircle className="size-6" />
                    We couldn&apos;t load availability just now.
                    <button
                      type="button"
                      onClick={() => {
                        setLoad("loading");
                        setReloadKey((k) => k + 1);
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-medium text-rose-700 ring-1 ring-rose-600/20 hover:bg-rose-100"
                    >
                      <RefreshCw className="size-4" /> Try again
                    </button>
                  </div>
                )}
                {load === "ready" && (
                  <DateRangePicker
                    booked={bookedFor[stay]}
                    value={range}
                    onChange={(r) => {
                      setRange(r);
                      setSubmit("idle");
                    }}
                  />
                )}
              </Step>

              {/* 3. Guests & details */}
              <Step n={3} title="Guests & your details" icon={<User className="size-5" />}>
                <div className="flex items-center justify-between rounded-2xl bg-sage-50 px-4 py-3 ring-1 ring-sage-200/70">
                  <div>
                    <p className="font-medium text-forest-900">Guests</p>
                    <p className="text-xs text-sage-500">{info.capacity}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Stepper
                      label="Remove a guest"
                      disabled={guests <= 1}
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                      icon={<Minus className="size-4" />}
                    />
                    <span className="w-8 text-center font-display text-2xl font-semibold text-forest-900 lining-nums tabular-nums" aria-live="polite">
                      {guests}
                    </span>
                    <Stepper
                      label="Add a guest"
                      disabled={guests >= info.maxGuests}
                      onClick={() => setGuests((g) => Math.min(info.maxGuests, g + 1))}
                      icon={<Plus className="size-4" />}
                    />
                  </div>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" error={touched ? errors.name : ""} icon={<User className="size-4" />}>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      placeholder="Your name"
                      className="peer w-full bg-transparent py-3 pr-4 text-forest-900 outline-none placeholder:text-sage-400"
                    />
                  </Field>
                  <Field label="Phone / WhatsApp" error={touched ? errors.phone : ""} icon={<Phone className="size-4" />}>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+94 77 123 4567"
                      className="peer w-full bg-transparent py-3 pr-4 text-forest-900 outline-none placeholder:text-sage-400"
                    />
                  </Field>
                </div>
                <div className="mt-5">
                  <Field label="Special requests (optional)">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      maxLength={500}
                      placeholder="Arrival time, extra bedding, anything we can prepare…"
                      className="w-full resize-none bg-transparent px-4 py-3 text-forest-900 outline-none placeholder:text-sage-400"
                    />
                  </Field>
                </div>
              </Step>

              {/* Mobile submit (desktop uses the summary card) */}
              <div className="lg:hidden">
                <SubmitButton state={submit} loading={load === "loading"} />
              </div>
            </form>

            {/* ---------------- Summary ---------------- */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <Reveal y={24}>
                <div className="overflow-hidden rounded-4xl bg-forest-950 text-white shadow-lift ring-1 ring-forest-900/10">
                  <div className="relative aspect-[16/9]">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.div
                        key={stay}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                      >
                        <Image src={info.image} alt="" fill sizes="400px" className="object-cover" />
                      </motion.div>
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/30 to-transparent" />
                    <div className="absolute bottom-4 left-5 right-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-300">Your stay</p>
                      <p className="mt-1 font-display text-3xl font-medium">{info.label}</p>
                    </div>
                  </div>

                  <div className="space-y-4 p-6">
                    <SummaryRow icon={<CalendarCheck2 className="size-4" />} label="Check-in" value={range.checkIn ? fmt(range.checkIn) : "Not selected"} muted={!range.checkIn} />
                    <SummaryRow icon={<CalendarDays className="size-4" />} label="Check-out" value={range.checkOut ? fmt(range.checkOut) : "Not selected"} muted={!range.checkOut} />
                    <SummaryRow icon={<MoonStar className="size-4" />} label="Nights" value={nights ? String(nights) : "–"} muted={!nights} />
                    <SummaryRow icon={<Users className="size-4" />} label="Guests" value={String(guests)} />

                    <div className="border-t border-white/10 pt-4">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Estimated total</p>
                          {pr && nights > 0 && (
                            <p className="mt-0.5 text-xs text-white/50 lining-nums">
                              Rs.{formatPrice(room?.price)} × {nights} night{nights === 1 ? "" : "s"}
                            </p>
                          )}
                        </div>
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.p
                            key={total ?? "none"}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="text-right font-display text-3xl font-semibold lining-nums"
                          >
                            {total ? <span className="text-gradient-gold">{total}</span> : <span className="text-white/30">—</span>}
                          </motion.p>
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="hidden lg:block">
                      <SubmitButton state={submit} loading={load === "loading"} onClick={send} />
                    </div>

                    <AnimatePresence>
                      {submit === "sent" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="rounded-2xl bg-leaf-500/10 p-4 text-sm ring-1 ring-leaf-400/30" role="status">
                            <p className="flex items-center gap-2 font-semibold text-leaf-200">
                              <CheckCircle2 className="size-4" /> Your request is ready in WhatsApp
                            </p>
                            <p className="mt-1 text-white/70">Press send in WhatsApp and we&apos;ll confirm your booking.</p>
                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-leaf-300 underline-offset-4 hover:underline">
                                WhatsApp didn&apos;t open?
                              </a>
                              <button type="button" onClick={reset} className="font-medium text-white/70 underline-offset-4 hover:text-white hover:underline">
                                Start a new request
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <ul className="space-y-2 pt-1 text-xs text-white/55">
                      <li className="flex items-center gap-2">
                        <ShieldCheck className="size-4 text-leaf-400" /> No payment needed to send a request
                      </li>
                      <li className="flex items-center gap-2">
                        <MessageCircle className="size-4 text-leaf-400" /> The host confirms availability & the final price
                      </li>
                      <li className="flex items-center gap-2">
                        <Phone className="size-4 text-leaf-400" /> Prefer to call?{" "}
                        <a href={CONTACT.phoneHref} className="text-white/80 hover:text-white">
                          {CONTACT.phoneDisplay}
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </Reveal>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

/* ------------------------------------------------------------------------ */

function Step({
  n,
  title,
  icon,
  error,
  aside,
  children,
}: {
  n: number;
  title: string;
  icon: ReactNode;
  error?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Reveal y={24} amount={0.1}>
      <fieldset
        data-error={!!error}
        className={`rounded-4xl bg-white p-5 shadow-soft ring-1 transition-shadow duration-300 sm:p-8 ${
          error ? "ring-2 ring-rose-300" : "ring-forest-900/5"
        }`}
      >
        <legend className="sr-only">{title}</legend>
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-forest-900 text-leaf-300">{icon}</span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-600">Step {n}</p>
              <h2 className="font-display text-2xl font-semibold leading-tight text-forest-900">{title}</h2>
            </div>
          </div>
          {aside}
        </div>
        {children}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex items-center gap-2 text-sm text-rose-600"
              role="alert"
            >
              <AlertCircle className="size-4" /> {error}
            </motion.p>
          )}
        </AnimatePresence>
      </fieldset>
    </Reveal>
  );
}

function Field({ label, error, icon, children }: { label: string; error?: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <label className="block" data-error={!!error}>
      <span className="mb-1.5 block text-sm font-medium text-forest-800">{label}</span>
      <span
        className={`flex items-center rounded-2xl bg-white ring-1 transition-all duration-200 focus-within:ring-2 focus-within:ring-leaf-500 focus-within:shadow-[0_0_0_4px_rgb(16_185_115/0.12)] ${
          error ? "ring-rose-300" : "ring-sage-200"
        }`}
      >
        {icon && <span className="pl-4 pr-2.5 text-sage-400">{icon}</span>}
        {children}
      </span>
      {error && <span className="mt-1.5 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}

function DateField({ label, value, active }: { label: string; value?: string; active: boolean }) {
  return (
    <div
      className={`rounded-2xl px-4 py-3 ring-1 transition-all duration-300 ${
        active ? "bg-leaf-50 ring-2 ring-leaf-500" : value ? "bg-white ring-forest-900/10" : "bg-sage-50 ring-sage-200"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-500">{label}</p>
      <p className={`mt-0.5 font-medium lining-nums ${value ? "text-forest-900" : "text-sage-400"}`}>
        {value ? fmt(value, { year: "numeric" }) : "Add date"}
      </p>
    </div>
  );
}

function Stepper({ label, disabled, onClick, icon }: { label: string; disabled: boolean; onClick: () => void; icon: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-10 place-items-center rounded-full bg-white text-forest-800 ring-1 ring-forest-900/10 transition-all duration-200 hover:ring-leaf-500 active:scale-95 disabled:opacity-35 disabled:hover:ring-forest-900/10"
    >
      {icon}
    </button>
  );
}

function SummaryRow({ icon, label, value, muted }: { icon: ReactNode; label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="flex items-center gap-2.5 text-white/60">
        <span className="text-leaf-400">{icon}</span>
        {label}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={value}
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -6 }}
          transition={{ duration: 0.2 }}
          className={`font-medium lining-nums ${muted ? "text-white/35" : "text-white"}`}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function SubmitButton({ state, loading, onClick }: { state: SubmitState; loading: boolean; onClick?: () => void }) {
  const busy = state === "opening";
  return (
    <button
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      disabled={busy || loading}
      className="group relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-leaf-500 text-base font-semibold text-forest-950 shadow-glow transition-all duration-300 ease-premium enabled:hover:-translate-y-0.5 enabled:hover:bg-leaf-400 disabled:cursor-wait disabled:opacity-70"
    >
      <span className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/40 blur-md transition-transform duration-700 ease-premium group-enabled:group-hover:translate-x-[420%]" />
      {busy ? (
        <>
          <Loader2 className="size-5 animate-spin" /> Opening WhatsApp…
        </>
      ) : loading ? (
        <>
          <Loader2 className="size-5 animate-spin" /> Loading availability…
        </>
      ) : (
        <>
          <MessageCircle className="size-5" /> Request on WhatsApp
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </>
      )}
    </button>
  );
}
