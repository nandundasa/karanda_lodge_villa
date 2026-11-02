"use client";
import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Images, Trash2 } from "lucide-react";
import { ConfirmDialog, Dropzone, EmptyState, Panel, useToast } from "./ui";

export type GalleryImage = { _id?: string; src: string; alt?: string };

type Props = {
  images: GalleryImage[];
  /** Uploads and saves one photo; resolves true on success */
  addPhoto: (file: File) => Promise<boolean>;
  deletePhoto: (img: GalleryImage) => Promise<boolean>;
  onChanged: () => Promise<void>;
};

/** Gallery photos are saved immediately: uploads go live, deletes ask first. */
export default function GalleryPanel({ images, addPhoto, deletePhoto, onChanged }: Props) {
  const toast = useToast();
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [pending, setPending] = useState<GalleryImage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const visible = images.filter((i) => i.src?.trim());

  const upload = async (files: File[]) => {
    setProgress({ done: 0, total: files.length });
    let ok = 0;
    for (const [n, f] of files.entries()) {
      if (await addPhoto(f)) ok++;
      setProgress({ done: n + 1, total: files.length });
    }
    await onChanged();
    setProgress(null);
    if (ok) toast(`${ok} photo${ok === 1 ? "" : "s"} added to the gallery.`);
    if (ok < files.length) toast(`${files.length - ok} upload${files.length - ok === 1 ? "" : "s"} failed.`, "error");
  };

  const confirmDelete = async () => {
    if (!pending) return;
    setDeleting(true);
    try {
      if (await deletePhoto(pending)) {
        await onChanged();
        toast("Photo removed from the gallery.");
      }
    } finally {
      setDeleting(false);
      setPending(null);
    }
  };

  return (
    <Panel
      title="Gallery"
      description={
        <>
          <span className="lining-nums">{visible.length}</span> photos on the Gallery page · changes go live immediately
        </>
      }
    >
      <Dropzone
        multiple
        onFiles={upload}
        busy={!!progress}
        busyLabel={progress ? `Uploading ${progress.done + (progress.done < progress.total ? 1 : 0)} of ${progress.total}…` : undefined}
        hint="Add several at once · JPG, PNG or WebP"
      />
      {progress && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sage-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-leaf-500 to-leaf-300"
            animate={{ width: `${Math.max(8, (progress.done / progress.total) * 100)}%` }}
          />
        </div>
      )}

      <div className="mt-6">
        {visible.length === 0 ? (
          <EmptyState icon={<Images className="size-6" />} title="The gallery is empty">
            Upload photos to show them on the Gallery page.
          </EmptyState>
        ) : (
          <motion.ul layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            <AnimatePresence initial={false}>
              {visible.map((img, i) => (
                <motion.li
                  key={img._id ?? img.src}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1, transition: { delay: Math.min(i, 18) * 0.015 } }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="group relative aspect-square overflow-hidden rounded-2xl bg-sage-100 ring-1 ring-forest-900/5"
                >
                  <Image
                    src={img.src}
                    alt={img.alt && img.alt !== "Gallery Image" ? img.alt : `Gallery photo ${i + 1}`}
                    fill
                    sizes="(min-width: 1280px) 15vw, (min-width: 640px) 30vw, 45vw"
                    className="object-cover transition-transform duration-700 ease-premium group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-forest-950/0 transition-colors duration-300 group-hover:bg-forest-950/40" />
                  <button
                    onClick={() => setPending(img)}
                    aria-label={`Delete photo ${i + 1}`}
                    className="absolute right-2 top-2 grid size-9 scale-90 place-items-center rounded-full bg-white/90 text-rose-600 opacity-0 shadow-soft transition-all duration-300 ease-premium hover:bg-rose-600 hover:text-white focus-visible:scale-100 focus-visible:opacity-100 group-hover:scale-100 group-hover:opacity-100"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>

      <ConfirmDialog
        open={!!pending}
        title="Delete this photo?"
        message="It will be removed from the Gallery page straight away."
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPending(null)}
      />
    </Panel>
  );
}
