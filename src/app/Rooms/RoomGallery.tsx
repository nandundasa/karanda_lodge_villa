"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";

type Props = {
  images: string[];
  name: string;
  /** Overlaid in the top-left corner (e.g. a price badge) */
  badge?: React.ReactNode;
};

export default function RoomGallery({ images, name, badge }: Props) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const strip = useRef<HTMLDivElement>(null);
  const count = images.length;

  const go = (next: number) => {
    setDirection(next > index || (index === count - 1 && next === 0) ? 1 : -1);
    setIndex((next + count) % count);
  };

  // Keep the active thumbnail visible in the strip
  useEffect(() => {
    const thumb = strip.current?.children[index] as HTMLElement | undefined;
    if (!thumb || !strip.current) return;
    const s = strip.current;
    const left = thumb.offsetLeft - s.clientWidth / 2 + thumb.clientWidth / 2;
    s.scrollTo({ left, behavior: "smooth" });
  }, [index]);

  if (count === 0) {
    return (
      <div className="grid aspect-[4/3] place-items-center rounded-4xl bg-sage-100 text-sage-400">
        <Images className="size-10" />
      </div>
    );
  }

  return (
    <div className="group/gallery">
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-4xl bg-forest-900 shadow-lift"
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${name} photos`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(index + 1);
          if (e.key === "ArrowLeft") go(index - 1);
        }}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={images[index]}
            custom={direction}
            className="absolute inset-0"
            initial={{ opacity: 0, x: direction * 40, scale: 1.04 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            drag={count > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(index + 1);
              else if (info.offset.x > 60) go(index - 1);
            }}
          >
            <Image
              src={images[index]}
              alt={`${name}, photo ${index + 1} of ${count}`}
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="pointer-events-none object-cover"
              priority={index === 0}
            />
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950/50 via-transparent to-forest-950/20" />

        {badge && <div className="absolute left-4 top-4 z-10 sm:left-5 sm:top-5">{badge}</div>}

        {count > 1 && (
          <>
            {(["prev", "next"] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => go(dir === "next" ? index + 1 : index - 1)}
                aria-label={dir === "next" ? "Next photo" : "Previous photo"}
                className={`glass absolute top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full text-white opacity-100 transition-all duration-300 ease-premium hover:scale-110 hover:bg-white/30 sm:opacity-0 sm:group-hover/gallery:opacity-100 sm:focus-visible:opacity-100 ${
                  dir === "next" ? "right-4" : "left-4"
                }`}
              >
                {dir === "next" ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
              </button>
            ))}
            <span className="glass-dark absolute bottom-4 right-4 z-10 rounded-full px-3 py-1 font-mono text-xs tabular-nums text-white/90">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div
          ref={strip}
          className="mt-3 flex gap-2 overflow-x-auto scroll-smooth px-0.5 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => go(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              className={`relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-xl transition-all duration-300 ease-premium sm:w-24 ${
                i === index
                  ? "ring-2 ring-leaf-500 ring-offset-2 ring-offset-ivory-50"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
