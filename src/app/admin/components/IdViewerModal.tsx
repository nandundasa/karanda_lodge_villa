"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarRange, CreditCard, ExternalLink, ImageOff, Maximize2, ShieldCheck, X } from "lucide-react";
import { formatStayDate } from "@/lib/stayDisplay";

export type IdSide = "front" | "back";
export type IdMeta = { size: number; uploadedAt: string } | null;

export type IdStay = {
  stayId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  idImages: Record<IdSide, IdMeta>;
};

const SIDES: { key: IdSide; label: string }[] = [
  { key: "front", label: "ID front" },
  { key: "back", label: "ID back" },
];

/** Auth-checked image URL; the version param busts caches when an ID is replaced. */
export function idImageUrl(stayId: string, side: IdSide, meta: IdMeta) {
  return `/api/manager/bookings/${encodeURIComponent(stayId)}/id-images/${side}?v=${encodeURIComponent(meta?.uploadedAt ?? "")}`;
}

const kb = (n: number) => (n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);

/** Read-only viewer for a stay's guest ID photos (admin). */
export default function IdViewerModal({ stay, onClose }: { stay: IdStay | null; onClose: () => void }) {
  const [zoom, setZoom] = useState<IdSide | null>(null);

  useEffect(() => {
    if (!stay) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (zoom) setZoom(null);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [stay, zoom, onClose]);

  return (
    <AnimatePresence onExitComplete={() => setZoom(null)}>
      {stay && (
        <motion.div
          key={stay.stayId}
          className="fixed inset-0 z-[55] flex items-end justify-center bg-forest-950/60 font-sans backdrop-blur-md sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="id-viewer-title"
            initial={{ y: 40, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[92svh] w-full max-w-4xl overflow-y-auto rounded-t-4xl bg-ivory-50 shadow-lift sm:rounded-4xl"
          >
            {/* header */}
            <div className="relative overflow-hidden bg-forest-950 px-6 pb-6 pt-6 text-white sm:px-8">
              <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-leaf-500/25 blur-3xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-300">
                    <CreditCard className="size-3.5" /> Guest identification
                  </p>
                  <h2 id="id-viewer-title" className="mt-2 font-display text-3xl font-semibold">
                    {stay.roomName}
                  </h2>
                  <p className="mt-1 flex items-center gap-2 text-sm text-white/65">
                    <CalendarRange className="size-4" />
                    {formatStayDate(stay.checkIn, { weekday: "short" })} → {formatStayDate(stay.checkOut, { weekday: "short" })}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  autoFocus
                  className="glass grid size-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/25"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* images */}
            <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
              {SIDES.map(({ key, label }, i) => (
                <motion.figure
                  key={key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                >
                  <figcaption className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-forest-900">{label}</span>
                    {stay.idImages[key] && (
                      <span className="text-xs text-sage-500 lining-nums">
                        {new Date(stay.idImages[key]!.uploadedAt).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        · {kb(stay.idImages[key]!.size)}
                      </span>
                    )}
                  </figcaption>
                  <IdImage stayId={stay.stayId} side={key} meta={stay.idImages[key]} label={label} onZoom={() => setZoom(key)} />
                </motion.figure>
              ))}
            </div>

            <p className="flex items-center gap-2 border-t border-sage-100 px-6 py-4 text-xs text-sage-500 sm:px-8">
              <ShieldCheck className="size-4 text-leaf-600" />
              Private: visible only to signed-in managers and admins, and never cached by the browser.
            </p>
          </motion.div>

          {/* full-screen zoom */}
          <AnimatePresence>
            {zoom && stay.idImages[zoom] && (
              <motion.div
                className="fixed inset-0 z-[60] flex items-center justify-center bg-forest-950/95 p-4 sm:p-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setZoom(null);
                }}
              >
                <motion.img
                  src={idImageUrl(stay.stayId, zoom, stay.idImages[zoom])}
                  alt={`${zoom === "front" ? "ID front" : "ID back"}, ${stay.roomName}`}
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
                />
                <button
                  onClick={() => setZoom(null)}
                  aria-label="Close full-screen view"
                  className="glass absolute right-5 top-5 grid size-11 place-items-center rounded-full text-white hover:bg-white/25"
                >
                  <X className="size-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function IdImage({
  stayId,
  side,
  meta,
  label,
  onZoom,
}: {
  stayId: string;
  side: IdSide;
  meta: IdMeta;
  label: string;
  onZoom: () => void;
}) {
  const [state, setState] = useState<"loading" | "ready" | "error">(meta ? "loading" : "error");
  const src = meta ? idImageUrl(stayId, side, meta) : null;

  if (!src) {
    return (
      <div className="grid aspect-[1.586] place-items-center rounded-2xl border-2 border-dashed border-sage-200 bg-sage-50 text-center">
        <div>
          <ImageOff className="mx-auto size-7 text-sage-300" />
          <p className="mt-2 text-sm font-medium text-sage-500">Not uploaded yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative aspect-[1.586] overflow-hidden rounded-2xl bg-forest-950 shadow-soft ring-1 ring-forest-900/10">
      {state === "loading" && <div className="skeleton absolute inset-0" />}
      {state === "error" ? (
        <div className="absolute inset-0 grid place-items-center bg-rose-50 text-center text-sm text-rose-700">
          <div>
            <ImageOff className="mx-auto size-7" />
            <p className="mt-2 font-medium">Couldn&apos;t load this image</p>
            <p className="text-xs text-rose-600/80">Your session may have expired. Try signing in again.</p>
          </div>
        </div>
      ) : (
        <button type="button" onClick={onZoom} aria-label={`View ${label} full screen`} className="absolute inset-0 cursor-zoom-in">
          {/* eslint-disable-next-line @next/next/no-img-element -- auth-protected, uncached binary route */}
          <img
            src={src}
            alt={label}
            onLoad={() => setState("ready")}
            onError={() => setState("error")}
            className={`size-full object-contain transition-all duration-500 ease-premium group-hover:scale-[1.03] ${state === "ready" ? "opacity-100" : "opacity-0"}`}
          />
          <span className="glass absolute bottom-3 right-3 grid size-9 place-items-center rounded-full text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
            <Maximize2 className="size-4" />
          </span>
        </button>
      )}
      {state === "ready" && (
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="glass absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity duration-300 hover:bg-white/25 group-hover:opacity-100 focus-visible:opacity-100"
        >
          <ExternalLink className="size-3.5" /> Open
        </a>
      )}
    </div>
  );
}
