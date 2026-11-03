"use client";
import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowUp, GalleryHorizontalEnd, Trash2 } from "lucide-react";
import { Dropzone, EmptyState, Panel, SaveBar, useToast } from "./ui";

type Props = {
  slides: string[];
  upload: (file: File) => Promise<string | null>;
  onSave: (slides: string[]) => Promise<boolean>;
};

/** Homepage hero slides: upload, reorder and remove, then save as a batch. */
export default function SlidesPanel({ slides, upload, onSave }: Props) {
  const toast = useToast();
  const [draft, setDraft] = useState(slides);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(slides);

  const add = async (files: File[]) => {
    setUploading(true);
    try {
      const path = await upload(files[0]);
      if (path) {
        setDraft((d) => [...d, path]);
        toast("Photo uploaded. Save changes to publish it.", "info");
      }
    } finally {
      setUploading(false);
    }
  };

  const move = (i: number, delta: number) =>
    setDraft((d) => {
      const j = i + delta;
      if (j < 0 || j >= d.length) return d;
      const next = [...d];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const save = async () => {
    setSaving(true);
    try {
      if (await onSave(draft)) toast("Slides published to the homepage.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel
      title="Homepage slides"
      description="These photos rotate in the homepage hero, in this order."
    >
      <Dropzone onFiles={add} busy={uploading} hint="Landscape photos look best · JPG, PNG or WebP" />

      <div className="mt-6">
        {draft.length === 0 ? (
          <EmptyState icon={<GalleryHorizontalEnd className="size-6" />} title="No slides yet">
            Upload a photo to start the homepage slideshow.
          </EmptyState>
        ) : (
          <motion.ol layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence initial={false}>
              {draft.map((src, i) => (
                <motion.li
                  key={src}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="group relative overflow-hidden rounded-2xl bg-sage-100 shadow-soft ring-1 ring-forest-900/5 transition-shadow hover:shadow-lift"
                >
                  <div className="relative aspect-[16/10]">
                    <Image src={src} alt={`Slide ${i + 1}`} fill sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 90vw" className="object-cover transition-transform duration-700 ease-premium group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-950/60 via-transparent to-transparent" />
                    <span className="glass-dark absolute left-3 top-3 grid size-8 place-items-center rounded-full text-sm font-semibold text-white lining-nums">
                      {i + 1}
                    </span>
                    {i === 0 && (
                      <span className="absolute right-3 top-3 rounded-full bg-gold-300 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-forest-950">
                        Shown first
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                    <span className="truncate font-mono text-xs text-sage-500">{src.split("/").pop()}</span>
                    <span className="flex shrink-0 gap-1">
                      <IconBtn label="Move earlier" disabled={i === 0} onClick={() => move(i, -1)}>
                        <ArrowUp className="size-4" />
                      </IconBtn>
                      <IconBtn label="Move later" disabled={i === draft.length - 1} onClick={() => move(i, 1)}>
                        <ArrowDown className="size-4" />
                      </IconBtn>
                      <IconBtn label="Remove slide" danger onClick={() => setDraft((d) => d.filter((_, k) => k !== i))}>
                        <Trash2 className="size-4" />
                      </IconBtn>
                    </span>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ol>
        )}
      </div>

      <SaveBar show={dirty} saving={saving} onSave={save} onDiscard={() => setDraft(slides)} message="Slide changes aren't live yet" />
    </Panel>
  );
}

export function IconBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid size-8 place-items-center rounded-full transition-colors disabled:opacity-30 ${
        danger ? "text-sage-500 enabled:hover:bg-rose-50 enabled:hover:text-rose-600" : "text-sage-500 enabled:hover:bg-leaf-50 enabled:hover:text-leaf-700"
      }`}
    >
      {children}
    </button>
  );
}
