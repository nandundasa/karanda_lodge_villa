"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CheckCircle2,
  CreditCard,
  ImageUp,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { compressImageClient, formatBytes } from "@/lib/compressImageClient";
import { formatStayDate } from "@/lib/stayDisplay";

export type Side = "front" | "back";
export const SIDES: { key: Side; label: string }[] = [
  { key: "front", label: "ID front" },
  { key: "back", label: "ID back" },
];

export type ImageMeta = { size: number; uploadedAt: string } | null;

export type SheetBooking = {
  stayId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  idImages: Record<Side, ImageMeta>;
};

type Picked = { file: File; originalSize: number; preview: string };
type Stage = "idle" | "uploading" | "processing" | "done" | "error";

/** POST with upload progress (fetch can't report upload progress). */
function uploadWithProgress(
  url: string,
  body: FormData,
  onProgress: (fraction: number) => void
): Promise<{ ok: boolean; status: number; data: { error?: string } }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {}
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data });
    };
    xhr.onerror = () => reject(new Error("Network error. Check your connection and try again."));
    xhr.send(body);
  });
}

export default function IdUploadSheet({
  booking,
  onClose,
  onUploaded,
  onUnauthorized,
}: {
  booking: SheetBooking;
  onClose: () => void;
  onUploaded: () => void | Promise<void>;
  onUnauthorized: () => void;
}) {
  const [picked, setPicked] = useState<Record<Side, Picked | null>>({ front: null, back: null });
  const [compressing, setCompressing] = useState<Record<Side, boolean>>({ front: false, back: false });
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const urls = useRef(new Set<string>());

  const busy = stage === "uploading" || stage === "processing";
  const anyCompressing = compressing.front || compressing.back;
  const ready = !!picked.front && !!picked.back && !anyCompressing && !busy && stage !== "done";

  // Release preview URLs when the sheet closes
  useEffect(() => {
    const set = urls.current;
    return () => set.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  // Escape closes (unless uploading); lock page scroll while open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [busy, onClose]);

  const pick = useCallback(async (side: Side, file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose a photo (JPG, PNG or WebP).");
      return;
    }
    setError("");
    setStage("idle");
    setCompressing((c) => ({ ...c, [side]: true }));
    try {
      const compressed = await compressImageClient(file);
      const preview = URL.createObjectURL(compressed);
      urls.current.add(preview);
      setPicked((prev) => {
        const old = prev[side]?.preview;
        if (old) {
          URL.revokeObjectURL(old);
          urls.current.delete(old);
        }
        return { ...prev, [side]: { file: compressed, originalSize: file.size, preview } };
      });
    } finally {
      setCompressing((c) => ({ ...c, [side]: false }));
    }
  }, []);

  const upload = async () => {
    if (!picked.front || !picked.back) return;
    setError("");
    setStage("uploading");
    setProgress(0);
    const form = new FormData();
    form.append("front", picked.front.file);
    form.append("back", picked.back.file);
    try {
      const res = await uploadWithProgress(
        `/api/manager/bookings/${encodeURIComponent(booking.stayId)}/id-images`,
        form,
        (f) => {
          setProgress(f);
          if (f >= 1) setStage("processing");
        }
      );
      if (res.status === 401) return onUnauthorized();
      if (!res.ok) throw new Error(res.data.error || "Upload failed");
      setStage("done");
      setTimeout(() => void onUploaded(), 1100);
    } catch (e) {
      setStage("error");
      setError(e instanceof Error ? e.message : "Upload failed");
    }
  };

  const existingSrc = (side: Side) => {
    const meta = booking.idImages[side];
    return meta
      ? `/api/manager/bookings/${encodeURIComponent(booking.stayId)}/id-images/${side}?v=${encodeURIComponent(meta.uploadedAt)}`
      : null;
  };

  const totalBefore = (picked.front?.originalSize ?? 0) + (picked.back?.originalSize ?? 0);
  const totalAfter = (picked.front?.file.size ?? 0) + (picked.back?.file.size ?? 0);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      initial="hidden"
      animate="show"
      exit="hidden"
    >
      {/* backdrop */}
      <motion.div
        className="absolute inset-0 bg-forest-950/55 backdrop-blur-sm"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        onClick={() => !busy && onClose()}
      />

      {/* sheet (bottom sheet on phones, dialog on larger screens) */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="id-sheet-title"
        variants={{
          hidden: { y: "100%", opacity: 0.6 },
          show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 340, damping: 34 } },
        }}
        className="relative max-h-[92svh] w-full overflow-y-auto rounded-t-3xl bg-ivory-50 shadow-lift sm:max-w-2xl sm:rounded-3xl"
      >
        {/* grab handle */}
        <div className="sticky top-0 z-10 bg-ivory-50/90 px-5 pt-3 pb-4 backdrop-blur sm:px-7 sm:pt-6">
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-sage-200 sm:hidden" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-leaf-700">Guest ID</p>
              <h2 id="id-sheet-title" className="font-display text-2xl font-semibold text-forest-900">
                {booking.roomName}
              </h2>
              <p className="text-sm text-sage-600">
                {formatStayDate(booking.checkIn, { weekday: "short" })} →{" "}
                {formatStayDate(booking.checkOut, { weekday: "short" })}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={busy}
              aria-label="Close"
              className="grid size-10 place-items-center rounded-full text-sage-600 transition-colors hover:bg-sage-100 hover:text-forest-900 disabled:opacity-40"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="space-y-5 px-5 pb-6 sm:px-7 sm:pb-7">
          <div className="grid gap-4 sm:grid-cols-2">
            {SIDES.map(({ key, label }, i) => (
              <DropZone
                key={key}
                index={i}
                label={label}
                picked={picked[key]}
                existing={existingSrc(key)}
                existingAt={booking.idImages[key]?.uploadedAt}
                compressing={compressing[key]}
                disabled={busy || stage === "done"}
                onFile={(f) => pick(key, f)}
              />
            ))}
          </div>

          {/* savings summary */}
          <AnimatePresence>
            {totalAfter > 0 && totalBefore > totalAfter && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 rounded-2xl bg-leaf-50 px-4 py-3 text-sm text-leaf-800 ring-1 ring-leaf-600/15">
                  <Sparkles className="size-4 shrink-0" />
                  <span>
                    Compressed on this device: <strong>{formatBytes(totalBefore)}</strong> →{" "}
                    <strong>{formatBytes(totalAfter)}</strong> (
                    {Math.round((1 - totalAfter / totalBefore) * 100)}% smaller)
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* progress */}
          <AnimatePresence>
            {stage !== "idle" && stage !== "error" && <UploadProgress stage={stage} progress={progress} />}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.p
                role="alert"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-600/15"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-xs text-sage-500">
              <ShieldCheck className="size-4 text-leaf-600" />
              Stored privately; only managers can view these photos.
            </p>
            <button
              onClick={upload}
              disabled={!ready}
              className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-forest-900 px-7 text-sm font-semibold text-white shadow-soft transition-all duration-300 ease-premium enabled:hover:-translate-y-0.5 enabled:hover:bg-forest-800 enabled:hover:shadow-glow disabled:cursor-not-allowed disabled:bg-sage-300"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : stage === "done" ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <UploadCloud className="size-4 transition-transform group-enabled:group-hover:-translate-y-0.5" />
              )}
              {busy ? "Uploading…" : stage === "done" ? "Saved" : "Save both photos"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------------ */

function DropZone({
  label,
  index,
  picked,
  existing,
  existingAt,
  compressing,
  disabled,
  onFile,
}: {
  label: string;
  index: number;
  picked: Picked | null;
  existing: string | null;
  existingAt?: string;
  compressing: boolean;
  disabled: boolean;
  onFile: (file: File | undefined) => void;
}) {
  const [over, setOver] = useState(false);
  const depth = useRef(0); // dragenter/leave fire for children too
  const src = picked?.preview ?? existing;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08 }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold text-forest-900">
          <CreditCard className="size-4 text-leaf-700" /> {label}
        </span>
        {picked ? (
          <span className="text-xs text-sage-500">
            {formatBytes(picked.originalSize)} → <span className="font-medium text-leaf-700">{formatBytes(picked.file.size)}</span>
          </span>
        ) : existing ? (
          <span className="flex items-center gap-1 text-xs text-leaf-700">
            <CheckCircle2 className="size-3.5" /> On file
          </span>
        ) : null}
      </div>

      <label
        onDragEnter={(e) => {
          e.preventDefault();
          if (disabled) return;
          depth.current++;
          setOver(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => {
          depth.current = Math.max(0, depth.current - 1);
          if (depth.current === 0) setOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          depth.current = 0;
          setOver(false);
          if (!disabled) onFile(e.dataTransfer.files?.[0]);
        }}
        className={`group relative block aspect-[1.586] cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 ease-premium focus-within:ring-2 focus-within:ring-leaf-500 focus-within:ring-offset-2 focus-within:ring-offset-ivory-50 ${
          disabled ? "pointer-events-none" : ""
        } ${
          over
            ? "scale-[1.02] bg-leaf-50 shadow-glow"
            : src
              ? "bg-forest-950 shadow-soft hover:shadow-lift"
              : "bg-white shadow-soft hover:-translate-y-0.5 hover:shadow-lift"
        }`}
      >
        {/* animated dashed border */}
        {!src && (
          <svg
            className="pointer-events-none absolute left-[1.5px] top-[1.5px] h-[calc(100%-3px)] w-[calc(100%-3px)] overflow-visible"
            aria-hidden
          >
            <rect
              width="100%"
              height="100%"
              rx="15"
              fill="none"
              strokeWidth="2"
              strokeDasharray="8 8"
              className={`transition-colors duration-300 ${over ? "stroke-leaf-500" : "stroke-sage-300 group-hover:stroke-leaf-400"}`}
              style={{ animation: over ? "kl-dash 0.6s linear infinite" : undefined }}
            />
          </svg>
        )}

        <AnimatePresence mode="wait">
          {src ? (
            <motion.div
              key={src}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- blob: and auth-protected URLs */}
              <img src={src} alt={`${label} preview`} className="size-full object-contain" />
              <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-forest-950/80 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                <span className="text-xs text-white/80">
                  {picked ? "New photo" : existingAt ? `Uploaded ${new Date(existingAt).toLocaleDateString()}` : ""}
                </span>
                <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white">
                  <RefreshCw className="size-3.5" /> Replace
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center"
            >
              <motion.span
                animate={over ? { y: -6, scale: 1.1 } : { y: 0, scale: 1 }}
                className={`grid size-12 place-items-center rounded-2xl transition-colors duration-300 ${
                  over ? "bg-leaf-500 text-white" : "bg-leaf-50 text-leaf-700 group-hover:bg-leaf-100"
                }`}
              >
                <ImageUp className="size-6" />
              </motion.span>
              <span className="text-sm font-medium text-forest-900">
                {over ? "Drop to add photo" : (
                  <>
                    <span className="sm:hidden">Tap to take or choose a photo</span>
                    <span className="hidden sm:inline">Drag a photo here or click to browse</span>
                  </>
                )}
              </span>
              <span className="text-xs text-sage-500">JPG, PNG or WebP</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* compressing overlay */}
        <AnimatePresence>
          {compressing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur-sm"
            >
              <Loader2 className="size-6 animate-spin text-leaf-600" />
              <span className="text-xs font-medium text-forest-800">Compressing…</span>
            </motion.div>
          )}
        </AnimatePresence>

        <input
          type="file"
          accept="image/*"
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
    </motion.div>
  );
}

/* ------------------------------------------------------------------------ */

const STEPS: { key: Exclude<Stage, "idle" | "error">; label: string }[] = [
  { key: "uploading", label: "Uploading" },
  { key: "processing", label: "Optimising" },
  { key: "done", label: "Saved" },
];

function UploadProgress({ stage, progress }: { stage: Stage; progress: number }) {
  const stepIndex = STEPS.findIndex((s) => s.key === stage);
  // Uploading fills 0–85%, server processing 85–100%
  const pct = stage === "uploading" ? progress * 85 : stage === "processing" ? 92 : 100;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
      aria-live="polite"
    >
      <div className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-forest-900/5">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-medium text-forest-900">
            {stage === "uploading" && `Uploading… ${Math.round(progress * 100)}%`}
            {stage === "processing" && "Optimising on the server…"}
            {stage === "done" && "Both photos saved"}
          </span>
          {stage === "done" ? (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
              <CheckCircle2 className="size-5 text-leaf-600" />
            </motion.span>
          ) : (
            <span className="font-mono text-xs tabular-nums text-sage-500">{Math.round(pct)}%</span>
          )}
        </div>

        <div
          className="relative h-2 overflow-hidden rounded-full bg-sage-100"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
        >
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-leaf-500 to-leaf-300 shadow-[0_0_12px_rgb(16_185_115/0.6)]"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
          {stage === "processing" && (
            <div className="absolute inset-0 animate-shimmer bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.6),transparent)] bg-[length:200%_100%]" />
          )}
        </div>

        <ol className="mt-3 grid grid-cols-3 gap-2 text-xs">
          {STEPS.map((s, i) => (
            <li
              key={s.key}
              className={`flex items-center gap-1.5 transition-colors ${
                i < stepIndex || stage === "done" ? "text-leaf-700" : i === stepIndex ? "text-forest-900" : "text-sage-400"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  i < stepIndex || stage === "done" ? "bg-leaf-500" : i === stepIndex ? "animate-pulse bg-forest-700" : "bg-sage-300"
                }`}
              />
              {s.label}
            </li>
          ))}
        </ol>
      </div>
    </motion.div>
  );
}
