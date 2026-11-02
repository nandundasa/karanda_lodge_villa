"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, CheckCircle2, ImageUp, Info, Loader2, RotateCcw, Save, X, XCircle } from "lucide-react";

/* ------------------------------------------------------------------------ */
/* Panel                                                                    */
/* ------------------------------------------------------------------------ */

export function Panel({
  title,
  description,
  actions,
  children,
  className = "",
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`overflow-clip rounded-3xl border border-forest-900/5 bg-white shadow-soft ${className}`}
    >
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-sage-100 px-5 py-5 sm:px-7">
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-semibold text-forest-900">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-sage-500">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </header>
      <div className="p-5 sm:p-7">{children}</div>
    </motion.section>
  );
}

/* ------------------------------------------------------------------------ */
/* Buttons                                                                  */
/* ------------------------------------------------------------------------ */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  icon?: ReactNode;
};

const VARIANTS = {
  primary: "bg-forest-900 text-white shadow-soft enabled:hover:bg-forest-800 enabled:hover:shadow-glow",
  secondary: "bg-white text-forest-800 ring-1 ring-forest-900/10 enabled:hover:ring-leaf-400/60",
  ghost: "text-sage-600 enabled:hover:bg-sage-100 enabled:hover:text-forest-900",
  danger: "bg-rose-600 text-white shadow-soft enabled:hover:bg-rose-700",
};

export function Button({ variant = "primary", loading, icon, children, className = "", disabled, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-all duration-300 ease-premium enabled:hover:-translate-y-0.5 enabled:active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------------ */
/* Toasts (replace window.alert)                                            */
/* ------------------------------------------------------------------------ */

type ToastTone = "success" | "error" | "info";
type Toast = { id: number; tone: ToastTone; message: string };
const ToastContext = createContext<(message: string, tone?: ToastTone) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const push = useCallback((message: string, tone: ToastTone = "success") => {
    const id = ++nextId.current;
    setToasts((t) => [...t, { id, tone, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "error" ? 6000 : 3500);
  }, []);

  const ICON = { success: CheckCircle2, error: XCircle, info: Info };
  const TONE = {
    success: "text-leaf-600",
    error: "text-rose-600",
    info: "text-sky-600",
  };

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-[min(380px,calc(100vw-2.5rem))] flex-col gap-2" aria-live="polite">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icon = ICON[t.tone];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="glass-light pointer-events-auto flex items-start gap-3 rounded-2xl border-0! p-4 shadow-lift ring-1 ring-forest-900/10"
                role={t.tone === "error" ? "alert" : "status"}
              >
                <Icon className={`mt-0.5 size-5 shrink-0 ${TONE[t.tone]}`} />
                <p className="flex-1 text-sm text-forest-900">{t.message}</p>
                <button
                  onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}
                  aria-label="Dismiss"
                  className="text-sage-400 transition-colors hover:text-forest-900"
                >
                  <X className="size-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/* ------------------------------------------------------------------------ */
/* Confirm dialog                                                           */
/* ------------------------------------------------------------------------ */

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[55] flex items-center justify-center bg-forest-950/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !busy && onCancel()}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            initial={{ scale: 0.94, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-lift"
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertTriangle className="size-6" />
            </span>
            <h3 id="confirm-title" className="mt-4 font-display text-2xl font-semibold text-forest-900">
              {title}
            </h3>
            <div className="mt-2 text-sm text-sage-600">{message}</div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={onCancel} disabled={busy} autoFocus>
                Cancel
              </Button>
              <Button variant="danger" onClick={onConfirm} loading={busy}>
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------------ */
/* Upload dropzone                                                          */
/* ------------------------------------------------------------------------ */

export function Dropzone({
  onFiles,
  multiple = false,
  busy = false,
  busyLabel = "Uploading…",
  hint = "JPG, PNG or WebP",
}: {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  busy?: boolean;
  busyLabel?: string;
  hint?: string;
}) {
  const [over, setOver] = useState(false);
  const depth = useRef(0);

  const take = (list: FileList | null | undefined) => {
    const files = Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  };

  return (
    <label
      onDragEnter={(e) => {
        e.preventDefault();
        depth.current++;
        setOver(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1);
        if (!depth.current) setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        depth.current = 0;
        setOver(false);
        if (!busy) take(e.dataTransfer.files);
      }}
      className={`group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-300 ease-premium focus-within:ring-2 focus-within:ring-leaf-500 ${
        busy ? "pointer-events-none border-leaf-300 bg-leaf-50/60" : over ? "scale-[1.01] border-leaf-500 bg-leaf-50 shadow-glow" : "border-sage-200 bg-sage-50/60 hover:border-leaf-400 hover:bg-leaf-50/50"
      }`}
    >
      <motion.span
        animate={over ? { y: -4, scale: 1.08 } : { y: 0, scale: 1 }}
        className={`grid size-12 place-items-center rounded-2xl transition-colors ${over ? "bg-leaf-500 text-white" : "bg-white text-leaf-700 shadow-soft"}`}
      >
        {busy ? <Loader2 className="size-6 animate-spin" /> : <ImageUp className="size-6" />}
      </motion.span>
      <span className="text-sm font-medium text-forest-900">
        {busy ? busyLabel : over ? "Drop to upload" : multiple ? "Drag photos here, or click to browse" : "Drag a photo here, or click to browse"}
      </span>
      <span className="text-xs text-sage-500">{hint}</span>
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        disabled={busy}
        className="sr-only"
        onChange={(e) => {
          take(e.target.files);
          e.target.value = "";
        }}
      />
    </label>
  );
}

/* ------------------------------------------------------------------------ */
/* Unsaved-changes bar                                                      */
/* ------------------------------------------------------------------------ */

export function SaveBar({
  show,
  message = "You have unsaved changes",
  saving,
  onSave,
  onDiscard,
}: {
  show: boolean;
  message?: ReactNode;
  saving?: boolean;
  onSave: () => void;
  onDiscard: () => void;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="sticky bottom-5 z-20 mt-6"
        >
          <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 rounded-full bg-forest-950 py-2 pl-5 pr-2 text-sm text-white shadow-lift ring-1 ring-white/10">
            <span className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold-300 opacity-70" />
                <span className="relative inline-flex size-2 rounded-full bg-gold-300" />
              </span>
              {message}
            </span>
            <span className="flex gap-2">
              <button
                onClick={onDiscard}
                disabled={saving}
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <RotateCcw className="size-4" /> Discard
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-leaf-500 px-4 font-semibold text-forest-950 transition-colors hover:bg-leaf-400 disabled:opacity-70"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {saving ? "Saving…" : "Save changes"}
              </button>
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function EmptyState({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-sage-200 px-6 py-12 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-sage-50 text-sage-400">{icon}</span>
      <p className="mt-3 font-display text-xl font-semibold text-forest-900">{title}</p>
      {children && <p className="mt-1 text-sm text-sage-500">{children}</p>}
    </div>
  );
}
