"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import { ArrowRight, BedDouble, Star, Trees, Users } from "lucide-react";

type HeroProps = {
  /** Slide image URLs (from /api/slides, with fallbacks). Empty while loading. */
  slides: string[];
  /** Lowest nightly price to show, e.g. "6,000". */
  startingPrice?: string;
  /** Milliseconds each slide stays on screen. */
  interval?: number;
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Hero({ slides, startingPrice = "6,000", interval = 6000 }: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Parallax: background drifts slower than the page, content lifts and fades
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Autoplay (paused on hover/focus and when the tab is hidden)
  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const id = setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % slides.length);
    }, interval);
    return () => clearInterval(id);
  }, [slides.length, paused, interval]);

  const current = slides.length ? slides[index % slides.length] : null;

  return (
    <section
      ref={ref}
      id="home"
      aria-label="Welcome to Karanda Lodge"
      className="relative isolate flex h-svh min-h-[640px] w-full items-center overflow-hidden bg-forest-950 font-sans text-white"
    >
      {/* ---- Background slideshow with parallax + Ken Burns ---- */}
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute inset-0 -z-20 will-change-transform"
      >
        <AnimatePresence initial={false}>
          {current ? (
            <motion.div
              key={current}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
            >
              <Image
                src={current}
                alt=""
                fill
                priority={index === 0}
                sizes="100vw"
                className="animate-ken-burns object-cover"
              />
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-forest-800 via-forest-900 to-forest-950" />
          )}
        </AnimatePresence>
      </motion.div>

      {/* ---- Readability overlays ---- */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-950 via-forest-950/45 to-forest-950/30" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_30%_40%,transparent_0%,rgb(10_29_22/0.55)_75%)]" />
      {/* Soft emerald glow bloom */}
      <div className="pointer-events-none absolute -left-32 top-1/3 -z-10 size-[520px] rounded-full bg-leaf-500/20 blur-[120px]" />

      {/* ---- Content ---- */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="mx-auto w-full max-w-7xl px-5 pb-56 pt-24 sm:px-8 sm:pb-44 sm:pt-28 lg:px-12"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-3xl">
          <motion.div
            variants={rise}
            className="glass inline-flex items-center gap-2.5 rounded-full py-1.5 pl-2 pr-4 text-sm text-white/90 shadow-lg shadow-black/10"
          >
            <span className="flex items-center gap-0.5 rounded-full bg-white/10 px-2 py-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-3.5 fill-gold-300 text-gold-300" />
              ))}
            </span>
            <span className="sm:hidden">Rated 5/5 on Google</span>
            <span className="hidden sm:inline">Rated 5/5 by our guests on Google</span>
          </motion.div>

          <motion.h1
            variants={rise}
            className="mt-7 font-display text-5xl font-medium leading-[0.95] tracking-tight text-balance sm:text-6xl lg:text-[5.5rem]"
          >
            Experience nature at{" "}
            <span className="text-gradient-gold block italic">Karanda Lodge</span>
          </motion.h1>

          <motion.p
            variants={rise}
            className="mt-6 max-w-xl text-base leading-relaxed text-white/80 text-pretty sm:text-lg"
          >
            A tranquil retreat wrapped in lush greenery: premium rooms, a private
            villa and slow, peaceful days in the heart of nature.
          </motion.p>

          <motion.div variants={rise} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/Booking"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-leaf-500 px-7 py-3.5 text-sm font-semibold text-forest-950 shadow-glow transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:bg-leaf-400 hover:shadow-[0_0_0_1px_rgb(108_233_174/0.5),0_12px_44px_-4px_rgb(16_185_115/0.7)] active:translate-y-0"
            >
              {/* sheen sweep on hover */}
              <span className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/40 blur-md transition-transform duration-700 ease-premium group-hover:translate-x-[420%]" />
              Check availability
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/Rooms"
              className="glass inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:bg-white/20"
            >
              Explore rooms
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ---- Glass info strip ---- */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 bottom-24 px-5 sm:bottom-10 sm:px-8 lg:px-12"
      >
        <div className="mx-auto flex max-w-7xl items-end justify-between gap-6">
          <dl className="glass-dark grid flex-1 grid-cols-3 divide-x divide-white/10 rounded-2xl py-4 shadow-2xl shadow-black/30 sm:max-w-2xl sm:py-5">
            {[
              { icon: BedDouble, label: "Stays", value: "Villa & 2 rooms", short: "3 options" },
              { icon: Users, label: "Guests", value: "Up to 9", short: "Up to 9" },
              { icon: Trees, label: "From", value: `Rs.${startingPrice}`, short: `Rs.${startingPrice}` },
            ].map(({ icon: Icon, label, value, short }) => (
              <div key={label} className="flex flex-col items-center gap-1 px-3 text-center sm:flex-row sm:gap-3 sm:px-6 sm:text-left">
                <span className="hidden size-10 shrink-0 place-items-center rounded-xl bg-leaf-500/15 text-leaf-300 sm:grid">
                  <Icon className="size-5" />
                </span>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-white/50">{label}</dt>
                  <dd className="whitespace-nowrap text-sm font-medium text-white sm:text-base">
                    <span className="sm:hidden">{short}</span>
                    <span className="hidden sm:inline">{value}</span>
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          {/* Slide indicators with progress */}
          {slides.length > 1 && (
            <div className="hidden items-center gap-2 pb-2 md:mr-20 md:flex" role="tablist" aria-label="Choose slide">
              {slides.map((src, i) => {
                const active = i === index % slides.length;
                return (
                  <button
                    key={src + i}
                    role="tab"
                    aria-selected={active}
                    aria-label={`Slide ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={`relative h-1 overflow-hidden rounded-full bg-white/25 transition-all duration-500 ease-premium hover:bg-white/40 ${active ? "w-12" : "w-6"}`}
                  >
                    {active && (
                      <motion.span
                        key={`${index}-${paused}`}
                        className="absolute inset-y-0 left-0 bg-gold-300"
                        initial={{ width: "0%" }}
                        animate={{ width: paused ? "0%" : "100%" }}
                        transition={{ duration: paused ? 0 : interval / 1000, ease: "linear" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* ---- Scroll cue ---- */}
      <a
        href="#stays"
        aria-label="Scroll to rooms"
        className="absolute bottom-32 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-white/60 transition-colors hover:text-white lg:flex"
      >
        Scroll
        <span className="flex h-9 w-5 justify-center rounded-full border border-white/40 pt-1.5">
          <span className="block size-1 animate-scroll-cue rounded-full bg-white" />
        </span>
      </a>
    </section>
  );
}
