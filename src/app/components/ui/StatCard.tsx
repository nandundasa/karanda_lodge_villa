"use client";
import type { ComponentType, ReactNode } from "react";
import { motion } from "motion/react";
import type { LucideProps } from "lucide-react";

type Tone = "forest" | "leaf" | "gold" | "earth";

const TONES: Record<Tone, { icon: string; glow: string }> = {
  forest: { icon: "bg-forest-100 text-forest-700", glow: "group-hover:shadow-[0_24px_48px_-16px_rgb(23_63_47/0.35)]" },
  leaf: { icon: "bg-leaf-100 text-leaf-700", glow: "group-hover:shadow-[0_24px_48px_-16px_rgb(16_185_115/0.45)]" },
  gold: { icon: "bg-gold-100 text-gold-700", glow: "group-hover:shadow-[0_24px_48px_-16px_rgb(217_171_69/0.5)]" },
  earth: { icon: "bg-earth-300/30 text-earth-700", glow: "group-hover:shadow-[0_24px_48px_-16px_rgb(156_113_73/0.45)]" },
};

type StatCardProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: ComponentType<LucideProps>;
  tone?: Tone;
  /** Stagger index for the entrance animation */
  index?: number;
  loading?: boolean;
};

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "forest",
  index = 0,
  loading = false,
}: StatCardProps) {
  const t = TONES[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
      className="group"
    >
      <div
        className={`relative overflow-hidden rounded-2xl border border-forest-900/5 bg-white p-5 shadow-soft transition-all duration-300 ease-premium group-hover:-translate-y-1 ${t.glow}`}
      >
        {/* corner sheen */}
        <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-gradient-to-br from-leaf-200/0 to-leaf-200/0 opacity-0 transition-opacity duration-500 group-hover:from-leaf-200/40 group-hover:opacity-100" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-sage-600">{label}</p>
            {loading ? (
              <div className="skeleton mt-3 h-8 w-20 rounded-lg" />
            ) : (
              <p className="mt-2 font-display text-4xl font-semibold leading-none tracking-tight text-forest-900 lining-nums tabular-nums">
                {value}
              </p>
            )}
            {hint && <p className="mt-2 text-xs text-sage-500">{hint}</p>}
          </div>
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-xl transition-transform duration-300 ease-premium group-hover:scale-110 group-hover:-rotate-6 ${t.icon}`}
          >
            <Icon className="size-5" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
