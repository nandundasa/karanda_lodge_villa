"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "motion/react";

const DURATION = 3600; // ms before the intro dismisses itself
const TITLE = "Karanda Lodge";

const letters: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.75 } },
};
const letter: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
});

/**
 * Full-screen intro shown on each full page load of the public site.
 * Rendered on the server so it covers the page from the first paint; a CSS
 * failsafe fades it out even if JavaScript never runs.
 */
export default function WelcomeScreen() {
  const pathname = usePathname();
  const hidden = pathname?.startsWith("/admin") || pathname?.startsWith("/manager");
  const [open, setOpen] = useState(!hidden);
  const ref = useRef<HTMLDivElement>(null);

  const dismiss = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const timer = setTimeout(dismiss, DURATION);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape" || e.key === " ") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, dismiss]);

  if (hidden) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          key="welcome"
          role="dialog"
          aria-modal="true"
          aria-label="Welcome to Karanda Lodge"
          tabIndex={-1}
          onClick={dismiss}
          initial={false}
          exit={{ opacity: 0, transition: { duration: 0.9, ease: [0.65, 0, 0.35, 1] } }}
          style={{ animation: "kl-welcome-failsafe 0.8s ease 6s forwards" }}
          className="fixed inset-0 z-[10000] flex cursor-pointer items-center justify-center overflow-hidden bg-forest-950 font-sans text-white outline-none"
        >
          {/* layered background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,var(--color-forest-700)_0%,var(--color-forest-900)_38%,var(--color-forest-950)_75%)]" />
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-[42%] size-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-leaf-500/20 blur-[120px]"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1.1, 1], opacity: [0, 1, 0.8] }}
            transition={{ duration: 2.4, ease: "easeOut" }}
          />
          <div aria-hidden className="absolute -bottom-40 -right-32 size-[460px] rounded-full bg-gold-400/10 blur-[120px]" />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.07)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
          />

          {/* content (scales away on exit) */}
          <motion.div
            className="relative flex flex-col items-center px-6 text-center"
            exit={{ scale: 1.06, opacity: 0, filter: "blur(10px)", transition: { duration: 0.7 } }}
          >
            {/* logo with expanding rings */}
            <div className="relative grid size-40 place-items-center sm:size-48">
              {[0, 0.6].map((delay) => (
                <motion.span
                  key={delay}
                  aria-hidden
                  className="absolute inset-0 rounded-full border border-leaf-300/40"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: [0.6, 1.45], opacity: [0, 0.7, 0] }}
                  transition={{ duration: 2.6, delay: 0.5 + delay, repeat: Infinity, ease: "easeOut" }}
                />
              ))}
              <motion.span
                aria-hidden
                className="absolute inset-4 rounded-full bg-white/5 ring-1 ring-white/10 backdrop-blur-sm"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.div
                initial={{ scale: 0.55, rotate: -24, opacity: 0, filter: "blur(14px)" }}
                animate={{ scale: 1, rotate: 0, opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.3, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="relative drop-shadow-[0_0_28px_rgb(108_233_174/0.55)]"
              >
                <Image src="/logo.png" alt="" width={112} height={112} priority className="size-24 sm:size-28" />
              </motion.div>
            </div>

            {/* title, letter by letter */}
            <motion.h1
              variants={letters}
              initial="hidden"
              animate="show"
              aria-label={TITLE}
              className="mt-8 font-display text-5xl font-medium tracking-tight sm:text-7xl"
            >
              {TITLE.split("").map((ch, i) => (
                <motion.span key={i} variants={letter} aria-hidden className="inline-block whitespace-pre">
                  {ch}
                </motion.span>
              ))}
            </motion.h1>

            <motion.span
              aria-hidden
              className="mt-5 h-px w-24 bg-gradient-to-r from-transparent via-gold-300 to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 1.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.p {...fadeUp(1.5)} className="mt-5 text-xs font-medium uppercase tracking-[0.38em] text-leaf-200/90 sm:text-sm">
              Your sanctuary in nature
            </motion.p>
            <motion.p {...fadeUp(1.7)} className="mt-2 font-display text-lg italic text-gold-200/80">
              Anuradhapura, Sri Lanka
            </motion.p>
          </motion.div>

          {/* progress + skip hint */}
          <motion.div {...fadeUp(1.9)} className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-3">
            <span className="h-0.5 w-40 overflow-hidden rounded-full bg-white/10">
              <motion.span
                className="block h-full origin-left bg-gradient-to-r from-leaf-400 to-gold-300"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: DURATION / 1000, ease: "linear" }}
              />
            </span>
            <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">Tap or press Enter to continue</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
