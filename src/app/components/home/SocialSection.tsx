"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Facebook, Images, Instagram, Play, X } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import Reveal from "../ui/Reveal";
import { SOCIAL, TIKTOK_POSTS, type TikTokPost } from "@/lib/content/site";

/** Shown only if TIKTOK_POSTS in src/lib/content/site.ts is empty */
const FALLBACK_TILES = [
  { src: "/IMG_0922.webp", label: "The villa" },
  { src: "/IMG_9537.webp", label: "Family room" },
  { src: "/IMG_8574.webp", label: "Little comforts" },
  { src: "/IMG_2256.webp", label: "Double room" },
];

export default function SocialSection() {
  const [playing, setPlaying] = useState<TikTokPost | null>(null);
  const posts = TIKTOK_POSTS.slice(0, 4);

  return (
    <section aria-labelledby="social-title" className="relative overflow-hidden bg-ivory-100 py-24 font-sans sm:py-32">
      <div className="pointer-events-none absolute -right-40 top-0 size-[520px] rounded-full bg-leaf-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 bottom-0 size-[420px] rounded-full bg-gold-100/80 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-16 lg:px-12">
        {/* ---------- Copy + profile card ---------- */}
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
              <span className="h-px w-8 bg-gold-400" /> Follow our journey
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 id="social-title" className="mt-5 font-display text-4xl font-medium leading-tight tracking-tight text-forest-900 text-balance sm:text-6xl">
              Life at the lodge, <span className="italic text-forest-600">one moment at a time</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-5 max-w-md text-base leading-relaxed text-sage-600 sm:text-lg">
              Slow mornings, garden walks and cosy evenings. See what a stay at
              Karanda Lodge really feels like.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-10 flex items-center gap-4 rounded-3xl bg-white p-4 pr-5 shadow-soft ring-1 ring-forest-900/5 sm:max-w-md">
              <span className="relative grid size-14 shrink-0 place-items-center rounded-full bg-forest-950 ring-2 ring-leaf-400/60 ring-offset-2 ring-offset-white">
                <Image src="/logo.png" alt="" width={34} height={34} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-forest-900">Karanda Lodge</p>
                <p className="text-sm text-sage-500">{SOCIAL.tiktokHandle}</p>
              </div>
              <a
                href={SOCIAL.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-11 items-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-glow"
              >
                <SiTiktok className="size-4" /> Follow
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-4 flex gap-3">
              {[
                { href: SOCIAL.instagram, label: "Instagram", icon: Instagram },
                { href: SOCIAL.facebook, label: "Facebook", icon: Facebook },
              ].map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-forest-800 shadow-soft ring-1 ring-forest-900/5 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:text-forest-950 hover:ring-leaf-400/40"
                >
                  <Icon className="size-4 text-forest-600 transition-colors group-hover:text-leaf-600" /> {label}
                  <ArrowUpRight className="size-3.5 opacity-50 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                </a>
              ))}
            </div>
          </Reveal>
        </div>

        {/* ---------- Video / moment tiles ---------- */}
        <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={0.1 + i * 0.1} amount={0.2} className={`w-[46%] shrink-0 snap-start sm:w-auto ${i % 2 ? "sm:mt-12" : ""}`}>
              {post.type === "video" ? (
                <Tile
                  image={post.cover}
                  label={post.label}
                  onClick={() => setPlaying(post)}
                  icon={<Play className="ml-0.5 size-6 fill-current" />}
                  badge="Video"
                  actionLabel={`Play video: ${post.label}`}
                />
              ) : (
                <Tile
                  image={post.cover}
                  label={post.label}
                  href={post.url}
                  icon={<Images className="size-5" />}
                  badge="Photos"
                  actionLabel={`${post.label}: view photos on TikTok`}
                />
              )}
            </Reveal>
          ))}

          {posts.length === 0 &&
            FALLBACK_TILES.map((t, i) => (
              <Reveal key={t.src} delay={0.1 + i * 0.1} amount={0.2} className={`w-[46%] shrink-0 snap-start sm:w-auto ${i % 2 ? "sm:mt-12" : ""}`}>
                <Tile
                  image={t.src}
                  label={t.label}
                  href={SOCIAL.tiktok}
                  icon={<SiTiktok className="size-5" />}
                  actionLabel={`${t.label}: see more on TikTok`}
                />
              </Reveal>
            ))}
        </div>
      </div>

      <AnimatePresence>{playing && <VideoLightbox post={playing} onClose={() => setPlaying(null)} />}</AnimatePresence>
    </section>
  );
}

/* ------------------------------------------------------------------------ */

function Tile({
  image,
  label,
  icon,
  actionLabel,
  badge,
  href,
  onClick,
}: {
  image: string;
  label: string;
  icon: React.ReactNode;
  actionLabel: string;
  badge?: string;
  href?: string;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <Image
        src={image}
        alt=""
        fill
        sizes="(min-width: 640px) 18vw, 46vw"
        className="object-cover transition-transform duration-[1.2s] ease-premium group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/10 to-transparent transition-opacity duration-500" />
      <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 transition-all duration-500 group-hover:ring-2 group-hover:ring-leaf-400/70" />

      {/* centre button: pulses in on hover */}
      <span className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 scale-75 place-items-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-md ring-1 ring-white/40 transition-all duration-500 ease-premium group-hover:scale-100 group-hover:bg-leaf-500 group-hover:text-forest-950 group-hover:opacity-100 group-hover:shadow-glow group-focus-visible:scale-100 group-focus-visible:opacity-100">
        <span className="absolute inset-0 rounded-full group-hover:animate-glow-pulse" />
        {icon}
      </span>

      {badge && (
        <span className="glass-dark absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90">
          <SiTiktok className="size-2.5" /> {badge}
        </span>
      )}
      <span className="absolute inset-x-3 bottom-3 line-clamp-2 text-sm font-medium text-white drop-shadow">{label}</span>
    </>
  );

  const cls =
    "group relative block aspect-[9/16] w-full overflow-hidden rounded-3xl bg-forest-900 shadow-soft transition-all duration-500 ease-premium hover:-translate-y-2 hover:shadow-[0_28px_50px_-16px_rgb(16_185_115/0.5)] focus-visible:outline-offset-4";

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={actionLabel} className={cls}>
      {inner}
    </a>
  ) : (
    <button type="button" onClick={onClick} aria-label={actionLabel} className={`${cls} text-left`}>
      {inner}
    </button>
  );
}

function VideoLightbox({ post, onClose }: { post: TikTokPost; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[1020] flex items-center justify-center bg-forest-950/80 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={post.label}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="relative aspect-[9/16] h-[min(85svh,760px)] overflow-hidden rounded-3xl bg-black shadow-2xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={`https://www.tiktok.com/player/v1/${post.id}?autoplay=1&rel=0&description=1&music_info=1`}
          title={post.label}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          className="size-full"
        />
      </motion.div>
      <button
        onClick={onClose}
        aria-label="Close video"
        className="glass absolute right-5 top-5 grid size-11 place-items-center rounded-full text-white transition-colors hover:bg-white/25"
      >
        <X className="size-5" />
      </button>
    </motion.div>
  );
}
