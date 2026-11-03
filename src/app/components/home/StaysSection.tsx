"use client";
import { useRef, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowRight, ArrowUpRight, BedDouble, Sparkles, Users } from "lucide-react";
import Reveal from "../ui/Reveal";
import { AMENITIES, TAGLINES, formatPrice, type Amenity, type RoomId } from "@/lib/content/rooms";

type RoomLike = { id: string; price?: number | string };

type Stay = {
  id: RoomId;
  name: string;
  tagline: string;
  description: string;
  image: string;
  guests: string;
  beds: string;
  fallbackPrice: string;
  amenities: Amenity[];
};

const VILLA: Stay = {
  id: "villa",
  name: "The Entire Villa",
  tagline: TAGLINES.villa,
  description:
    "Both rooms and every amenity, all to yourselves: the Family Room and Double Room plus exclusive use of the living areas, kitchen and outdoor spaces.",
  image: "/IMG_0922.webp",
  guests: "7–9 guests",
  beds: "2 bedrooms · 2 bathrooms",
  fallbackPrice: "18,000",
  amenities: AMENITIES.villa,
};

const ROOMS: Stay[] = [
  {
    id: "family-room",
    name: "Family Room",
    tagline: TAGLINES["family-room"],
    description: "Room for the whole family, with a private balcony and calm garden views.",
    image: "/IMG_9527.webp",
    guests: "4–5 guests",
    beds: "1 King + 1 Queen",
    fallbackPrice: "7,000–8,000",
    amenities: AMENITIES["family-room"],
  },
  {
    id: "double-room",
    name: "Double Room",
    tagline: TAGLINES["double-room"],
    description: "A romantic retreat for two, with modern comforts and a garden outlook.",
    image: "/IMG_2255.webp",
    guests: "2 guests",
    beds: "1 Queen",
    fallbackPrice: "6,000",
    amenities: AMENITIES["double-room"],
  },
];

export default function StaysSection({ rooms }: { rooms: RoomLike[] }) {
  const priceFor = (s: Stay) => formatPrice(rooms.find((r) => r.id === s.id)?.price, s.fallbackPrice);

  return (
    <section id="stays" className="relative overflow-hidden bg-ivory-50 py-24 font-sans sm:py-32">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-300/60 to-transparent" />
      <div className="pointer-events-none absolute -left-40 top-32 size-[480px] rounded-full bg-sage-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 size-[520px] rounded-full bg-leaf-100/60 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
              <span className="h-px w-8 bg-gold-400" /> Stay with us <span className="h-px w-8 bg-gold-400" />
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 font-display text-4xl font-medium leading-tight tracking-tight text-forest-900 text-balance sm:text-6xl">
              Find your <span className="italic text-forest-600">sanctuary</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-5 text-base leading-relaxed text-sage-600 text-pretty sm:text-lg">
              Book the whole villa for complete privacy, or choose one of our two
              thoughtfully prepared rooms.
            </p>
          </Reveal>
        </div>

        {/* Featured villa */}
        <Reveal className="mt-16 sm:mt-20" amount={0.2}>
          <VillaCard stay={VILLA} price={priceFor(VILLA)} />
        </Reveal>

        {/* Rooms */}
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {ROOMS.map((room, i) => (
            <Reveal key={room.id} delay={i * 0.12} amount={0.2}>
              <RoomCard stay={room} price={priceFor(room)} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */

/** Cursor-following glow + gentle 3D tilt shared by both card types. */
function useCardHover(maxTilt = 4) {
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const rx = useSpring(0, { stiffness: 200, damping: 20 });
  const ry = useSpring(0, { stiffness: 200, damping: 20 });
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${mx}% ${my}%, rgb(52 213 141 / 0.22), transparent 45%)`;

  const onMouseMove = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    mx.set(px * 100);
    my.set(py * 100);
    ry.set((px - 0.5) * maxTilt * 2);
    rx.set((0.5 - py) * maxTilt * 2);
  };
  const onMouseLeave = () => {
    rx.set(0);
    ry.set(0);
  };
  return { spotlight, rx, ry, onMouseMove, onMouseLeave };
}

function VillaCard({ stay, price }: { stay: Stay; price: string }) {
  const ref = useRef<HTMLElement>(null);
  const { spotlight, onMouseMove, onMouseLeave } = useCardHover();
  // Image drifts inside its frame as the card scrolls past
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <article
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="group relative grid overflow-hidden rounded-4xl bg-forest-950 text-white shadow-lift ring-1 ring-forest-900/10 transition-shadow duration-500 hover:shadow-[0_40px_80px_-24px_rgb(17_47_35/0.55)] lg:grid-cols-[1.15fr_1fr]"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: spotlight }}
      />

      {/* image */}
      <div className="relative min-h-[320px] overflow-hidden sm:min-h-[420px]">
        <motion.div style={{ y: imgY }} className="absolute -inset-y-[10%] inset-x-0">
          <Image
            src={stay.image}
            alt="The villa's double-height living room"
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover transition-transform duration-[1.4s] ease-premium group-hover:scale-[1.06]"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-forest-950/10 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-forest-950" />
        <span className="glass-dark absolute left-5 top-5 z-10 inline-flex bg-forest-950/65! items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold-200">
          <Sparkles className="size-3.5" /> Signature stay
        </span>
      </div>

      {/* content */}
      <div className="relative z-20 flex flex-col p-7 sm:p-10 lg:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-leaf-500/15 blur-3xl" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.28em] text-gold-300">{stay.tagline}</p>
        <h3 className="relative mt-3 font-display text-4xl font-medium leading-tight sm:text-5xl">{stay.name}</h3>
        <p className="relative mt-4 leading-relaxed text-white/70">{stay.description}</p>

        <div className="relative mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
          <span className="inline-flex items-center gap-2"><Users className="size-4 text-leaf-300" /> {stay.guests}</span>
          <span className="inline-flex items-center gap-2"><BedDouble className="size-4 text-leaf-300" /> {stay.beds}</span>
        </div>

        <ul className="relative mt-6 flex flex-wrap gap-2">
          {stay.amenities.map(({ icon: Icon, label }, i) => (
            <motion.li
              key={label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.04 }}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/80 ring-1 ring-white/10 transition-colors duration-300 hover:bg-white/10 hover:text-white"
            >
              <Icon className="size-3.5 shrink-0 text-leaf-300" /> {label}
            </motion.li>
          ))}
        </ul>

        <div className="relative mt-auto flex flex-wrap items-end justify-between gap-5 pt-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">From</p>
            <p className="font-display text-4xl font-semibold lining-nums">
              <span className="text-gradient-gold">Rs.{price}</span>
              <span className="ml-1 font-sans text-sm font-normal text-white/50">/ night</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/Rooms#${stay.id}`}
              className="glass inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:bg-white/20"
            >
              Details
            </Link>
            <Link
              href={`/Booking?stay=${stay.id}`}
              className="group/btn inline-flex h-12 items-center gap-2 rounded-full bg-leaf-500 px-6 text-sm font-semibold text-forest-950 shadow-glow transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:bg-leaf-400"
            >
              Check dates
              <ArrowRight className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function RoomCard({ stay, price }: { stay: Stay; price: string }) {
  const { spotlight, rx, ry, onMouseMove, onMouseLeave } = useCardHover(3);

  return (
    <motion.article
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-4xl bg-white shadow-soft ring-1 ring-forest-900/5 transition-shadow duration-500 hover:shadow-[0_32px_64px_-20px_rgb(17_47_35/0.35)] hover:ring-leaf-500/25"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: spotlight }}
      />

      {/* image */}
      <Link href={`/Rooms#${stay.id}`} className="relative block aspect-[4/3] overflow-hidden" tabIndex={-1} aria-hidden>
        <Image
          src={stay.image}
          alt=""
          fill
          sizes="(min-width: 768px) 45vw, 100vw"
          className="object-cover transition-transform duration-[1.2s] ease-premium group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="glass-dark absolute right-4 top-4 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/20 lining-nums">
          Rs.{price}
          <span className="ml-1 text-xs font-normal text-white/70">/ night</span>
        </span>
        <span className="absolute bottom-4 left-4 inline-flex items-center gap-3 text-sm text-white/90">
          <span className="inline-flex items-center gap-1.5"><Users className="size-4" /> {stay.guests}</span>
          <span className="inline-flex items-center gap-1.5"><BedDouble className="size-4" /> {stay.beds}</span>
        </span>
      </Link>

      {/* content */}
      <div className="relative z-20 flex flex-1 flex-col p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-600">{stay.tagline}</p>
        <h3 className="mt-2 font-display text-3xl font-medium text-forest-900">
          <Link href={`/Rooms#${stay.id}`} className="after:absolute after:inset-0 after:content-['']">
            {stay.name}
          </Link>
        </h3>
        <p className="mt-3 leading-relaxed text-sage-600">{stay.description}</p>

        <ul className="mt-5 flex flex-wrap gap-2">
          {stay.amenities.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full bg-sage-50 px-3 py-1.5 text-xs text-sage-700 ring-1 ring-sage-200/70 transition-colors duration-300 group-hover:bg-leaf-50 group-hover:ring-leaf-200"
            >
              <Icon className="size-3.5 text-forest-500" /> {label}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center justify-between pt-7">
          <span className="text-sm font-semibold text-forest-800">View room details</span>
          <span className="grid size-11 place-items-center rounded-full bg-forest-900 text-white transition-all duration-500 ease-premium group-hover:rotate-45 group-hover:bg-leaf-500 group-hover:text-forest-950 group-hover:shadow-glow">
            <ArrowUpRight className="size-5" />
          </span>
        </div>
      </div>
    </motion.article>
  );
}
