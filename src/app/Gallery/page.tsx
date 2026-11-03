"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence } from "motion/react";
import { Expand, ImageOff, Images } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageHero from "../components/ui/PageHero";
import Reveal from "../components/ui/Reveal";
import Lightbox, { type Photo } from "./Lightbox";

type LoadState = "loading" | "ready" | "error";

const MASONRY_RATIOS = [3 / 4, 1, 4 / 5, 3 / 4, 5 / 4, 9 / 10, 4 / 5];

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/gallery", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        const list: Photo[] = (Array.isArray(data.images) ? data.images : [])
          .filter((p: Partial<Photo>) => typeof p.src === "string" && p.src.length > 0)
          .map((p: Photo) => ({ src: p.src, alt: p.alt, width: p.width, height: p.height }));
        setPhotos(list);
        setState(res.ok ? "ready" : "error");
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  // Photos whose file is missing are dropped instead of showing a broken image
  const visible = photos.filter((p) => !broken.has(p.src));

  return (
    <>
      <Navbar />
      <main className="bg-ivory-50 font-sans">
        <PageHero
          image="/IMG_0937.webp"
          imageAlt="Looking down into the villa's living room from the mezzanine"
          eyebrow="Gallery"
          title={
            <>
              A glimpse of <span className="italic text-gradient-gold">life at the lodge</span>
            </>
          }
          subtitle="Wander through the villa, the rooms and the little details that make every stay feel like home."
        >
          {state === "ready" && visible.length > 0 && (
            <p className="glass mt-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm lining-nums">
              <Images className="size-4 text-gold-200" /> {visible.length} photos
            </p>
          )}
        </PageHero>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-24 lg:px-12" aria-label="Photo gallery">
          {state === "loading" && (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {[4 / 3, 3 / 4, 1, 4 / 3, 3 / 4, 4 / 3].map((ratio, i) => (
                <div key={i} className="skeleton mb-4 w-full break-inside-avoid rounded-3xl" style={{ aspectRatio: ratio }} />
              ))}
            </div>
          )}

          {state !== "loading" && visible.length === 0 && (
            <div className="rounded-4xl border border-dashed border-sage-300 bg-white/60 px-6 py-20 text-center">
              <ImageOff className="mx-auto size-10 text-sage-300" />
              <p className="mt-4 font-display text-2xl text-forest-900">
                {state === "error" ? "We couldn't load the gallery just now" : "Photos are on their way"}
              </p>
              <p className="mt-2 text-sage-500">Please check back soon.</p>
            </div>
          )}

          {visible.length > 0 && (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
              {visible.map((photo, i) => {
                const natural = photo.width && photo.height ? photo.width / photo.height : 4 / 3;
                // Most photos are 3:4 phone shots; vary portrait crops so the columns stagger.
                // The lightbox always shows the full, uncropped photo.
                const ratio = natural < 1 ? MASONRY_RATIOS[i % MASONRY_RATIOS.length] : natural;
                return (
                  <Reveal key={photo.src} delay={(i % 3) * 0.08} y={28} amount={0.15} className="break-inside-avoid">
                    <button
                      onClick={() => setOpen(i)}
                      aria-label={`Open photo ${i + 1}${photo.alt && photo.alt !== "Gallery Image" ? `: ${photo.alt}` : ""}`}
                      className="group relative block w-full overflow-hidden rounded-3xl bg-sage-100 shadow-soft ring-1 ring-forest-900/5 transition-all duration-500 ease-premium hover:-translate-y-1 hover:shadow-[0_28px_56px_-20px_rgb(17_47_35/0.4)] focus-visible:outline-offset-4"
                      style={{ aspectRatio: ratio }}
                    >
                      <Image
                        src={photo.src}
                        alt={photo.alt && photo.alt !== "Gallery Image" ? photo.alt : `Karanda Lodge photo ${i + 1}`}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-[1.2s] ease-premium group-hover:scale-[1.06]"
                        onError={() => setBroken((b) => new Set(b).add(photo.src))}
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-forest-950/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />
                      <span className="glass absolute bottom-4 right-4 grid size-11 translate-y-2 place-items-center rounded-full text-white opacity-0 transition-all duration-500 ease-premium group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                        <Expand className="size-4" />
                      </span>
                    </button>
                  </Reveal>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />

      <AnimatePresence>
        {open !== null && visible[open] && (
          <Lightbox photos={visible} index={open} onIndexChange={setOpen} onClose={() => setOpen(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
