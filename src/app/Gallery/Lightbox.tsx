"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type Photo = { src: string; alt: string; width?: number; height?: number };

type Props = {
  photos: Photo[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
};

export default function Lightbox({ photos, index, onIndexChange, onClose }: Props) {
  const [direction, setDirection] = useState(1);
  const strip = useRef<HTMLDivElement>(null);
  const count = photos.length;
  const photo = photos[index];

  const go = (delta: number) => {
    setDirection(delta);
    onIndexChange((index + delta + count) % count);
  };

  // Latest handlers for the (mount-once) key listener
  const keys = useRef({ go, onClose });
  useEffect(() => {
    keys.current = { go, onClose };
  });

  // Keyboard, scroll lock, and return focus to the opener on close (once)
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") keys.current.onClose();
      if (e.key === "ArrowRight") keys.current.go(1);
      if (e.key === "ArrowLeft") keys.current.go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      opener?.focus?.();
    };
  }, []);

  // Keep the active thumbnail centred
  useEffect(() => {
    const s = strip.current;
    const t = s?.children[index] as HTMLElement | undefined;
    if (s && t) s.scrollTo({ left: t.offsetLeft - s.clientWidth / 2 + t.clientWidth / 2, behavior: "smooth" });
  }, [index]);

  if (!photo) return null;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fixed inset-0 z-[1020] flex flex-col bg-forest-950/95 font-sans text-white backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* top bar */}
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <span className="font-mono text-sm tabular-nums text-white/70">
          {index + 1} <span className="text-white/30">/</span> {count}
        </span>
        <button
          onClick={onClose}
          aria-label="Close photo viewer"
          autoFocus
          className="glass grid size-11 place-items-center rounded-full transition-colors hover:bg-white/25"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* stage */}
      <div className="relative min-h-0 flex-1" onClick={onClose}>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={photo.src}
            custom={direction}
            className="absolute inset-0 px-4 sm:px-20"
            initial={{ opacity: 0, x: direction * 80, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction * -80, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            drag={count > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={(_, info) => {
              if (info.offset.x < -70) go(1);
              else if (info.offset.x > 70) go(-1);
            }}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="100vw"
              priority
              className="pointer-events-none object-contain drop-shadow-2xl"
            />
          </motion.div>
        </AnimatePresence>

        {count > 1 &&
          ([-1, 1] as const).map((d) => (
            <button
              key={d}
              onClick={(e) => {
                e.stopPropagation();
                go(d);
              }}
              aria-label={d === 1 ? "Next photo" : "Previous photo"}
              className={`glass absolute top-1/2 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full transition-all duration-300 ease-premium hover:scale-110 hover:bg-white/25 sm:grid ${
                d === 1 ? "right-5" : "left-5"
              }`}
            >
              {d === 1 ? <ChevronRight className="size-6" /> : <ChevronLeft className="size-6" />}
            </button>
          ))}
      </div>

      {/* caption + thumbnails */}
      <div className="px-4 pb-5 pt-3 sm:px-6">
        {photo.alt && photo.alt !== "Gallery Image" && (
          <p className="mb-3 text-center text-sm text-white/70">{photo.alt}</p>
        )}
        {count > 1 && (
          <div
            ref={strip}
            className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {photos.map((p, i) => (
              <button
                key={p.src + i}
                onClick={() => {
                  setDirection(i > index ? 1 : -1);
                  onIndexChange(i);
                }}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition-all duration-300 ${
                  i === index ? "ring-2 ring-leaf-400 ring-offset-2 ring-offset-forest-950" : "opacity-40 hover:opacity-90"
                }`}
              >
                <Image src={p.src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
