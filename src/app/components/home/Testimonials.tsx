"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { MapPin, Quote, Star } from "lucide-react";
import Reveal from "../ui/Reveal";
import { RATING_SUMMARY, REVIEWS, type Review } from "@/lib/content/reviews";

export default function Testimonials() {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Mobile carousel: keep the dots in sync with the scroll-snapped card
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const cards = Array.from(el.children) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(cards.indexOf(e.target as HTMLElement));
        }
      },
      { root: el, threshold: 0.6 }
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  const goTo = (i: number) => {
    const card = track.current?.children[i] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <section
      aria-labelledby="reviews-title"
      className="relative isolate overflow-hidden bg-forest-950 py-24 font-sans text-white sm:py-32"
    >
      {/* ambient light */}
      <div className="pointer-events-none absolute -left-32 top-10 -z-10 size-[520px] rounded-full bg-leaf-500/15 blur-[110px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 -z-10 size-[460px] rounded-full bg-gold-400/10 blur-[110px]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(rgb(255_255_255/0.06)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Heading + rating summary */}
        <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <Reveal>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">
                <span className="h-px w-8 bg-gold-400/70" /> Guest stories
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 id="reviews-title" className="mt-5 font-display text-4xl font-medium leading-tight tracking-tight text-balance sm:text-6xl">
                Trusted by travellers <span className="italic text-gradient-gold">from around the world</span>
              </h2>
            </Reveal>
          </div>

          <Reveal delay={0.16}>
            <div className="glass flex items-center gap-5 rounded-3xl px-6 py-5 shadow-2xl shadow-black/20">
              <p className="font-display text-6xl font-semibold leading-none lining-nums">{RATING_SUMMARY.score}</p>
              <div>
                <Stars count={5} className="size-4" />
                <p className="mt-2 text-sm text-white/70">
                  {RATING_SUMMARY.count} reviews on <span className="font-semibold text-white">{RATING_SUMMARY.source}</span>
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Cards: scroll-snap carousel on phones, 3-up grid on desktop */}
        <div
          ref={track}
          className="-mx-5 mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
        >
          {REVIEWS.map((review, i) => (
            <Reveal
              key={review.name}
              delay={0.1 + i * 0.12}
              amount={0.15}
              className={`w-[85%] shrink-0 snap-center sm:w-[60%] lg:w-auto ${i === 1 ? "lg:translate-y-8" : ""}`}
            >
              <ReviewCard review={review} />
            </Reveal>
          ))}
        </div>

        {/* Mobile dots */}
        <div className="mt-4 flex justify-center gap-2 lg:hidden" role="tablist" aria-label="Choose review">
          {REVIEWS.map((r, i) => (
            <button
              key={r.name}
              role="tab"
              aria-selected={active === i}
              aria-label={`Review ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ease-premium ${active === i ? "w-8 bg-gold-300" : "w-3 bg-white/25"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const long = review.text.length > 260;
  const initials = review.name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <figure className="group relative flex h-full flex-col overflow-hidden rounded-4xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition-all duration-500 ease-premium hover:-translate-y-1.5 hover:border-leaf-400/30 hover:bg-white/[0.07] hover:shadow-[0_30px_60px_-20px_rgb(16_185_115/0.35)] sm:p-8">
      {/* glow on hover */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-leaf-400/0 blur-3xl transition-colors duration-700 group-hover:bg-leaf-400/20" />

      <div className="relative flex items-start justify-between">
        <motion.span
          initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
          whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.25 }}
          className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-gold-300 to-gold-500 text-forest-950 shadow-glow-gold"
        >
          <Quote className="size-5 fill-current" />
        </motion.span>
        <Stars count={review.rating} className="size-3.5" />
      </div>

      <blockquote className="relative mt-6 flex-1">
        <p
          className={`font-display text-xl leading-relaxed text-white/90 lining-nums sm:text-[1.35rem] ${
            long && !expanded ? "line-clamp-6" : ""
          }`}
        >
          “{review.text}”
        </p>
        {long && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="mt-3 text-sm font-medium text-leaf-300 underline-offset-4 transition-colors hover:text-leaf-200 hover:underline"
            aria-expanded={expanded}
          >
            {expanded ? "Show less" : "Read full review"}
          </button>
        )}
      </blockquote>

      <figcaption className="relative mt-8 flex items-center gap-4 border-t border-white/10 pt-6">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-forest-500 to-forest-800 text-sm font-semibold text-gold-200 ring-2 ring-white/10">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-white">{review.name}</p>
          <p className="flex items-center gap-1 text-xs text-white/55">
            <MapPin className="size-3" /> {review.location} · {review.date}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

function Stars({ count, className }: { count: number; className?: string }) {
  return (
    <span className="flex gap-0.5" aria-label={`${count} out of 5 stars`} role="img">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${className} ${i < count ? "fill-gold-300 text-gold-300" : "text-white/20"}`} />
      ))}
    </span>
  );
}
