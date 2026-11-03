import type { ReactNode } from "react";

export type PillTone = "leaf" | "gold" | "sky" | "rose" | "sage" | "forest";

const TONES: Record<PillTone, { pill: string; dot: string }> = {
  leaf: { pill: "bg-leaf-50 text-leaf-800 ring-leaf-600/20", dot: "bg-leaf-500" },
  gold: { pill: "bg-gold-100/70 text-gold-700 ring-gold-500/25", dot: "bg-gold-500" },
  sky: { pill: "bg-sky-50 text-sky-800 ring-sky-600/20", dot: "bg-sky-500" },
  rose: { pill: "bg-rose-50 text-rose-700 ring-rose-600/20", dot: "bg-rose-500" },
  sage: { pill: "bg-sage-100 text-sage-700 ring-sage-500/20", dot: "bg-sage-400" },
  forest: { pill: "bg-forest-100 text-forest-800 ring-forest-600/20", dot: "bg-forest-600" },
};

/** Small color-coded status label with an optional pulsing dot. */
export default function StatusPill({
  tone,
  children,
  pulse = false,
  icon,
}: {
  tone: PillTone;
  children: ReactNode;
  pulse?: boolean;
  icon?: ReactNode;
}) {
  const t = TONES[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${t.pill}`}
    >
      {icon ?? (
        <span className="relative flex size-2">
          {pulse && (
            <span className={`absolute inline-flex size-full animate-ping rounded-full opacity-60 ${t.dot}`} />
          )}
          <span className={`relative inline-flex size-2 rounded-full ${t.dot}`} />
        </span>
      )}
      {children}
    </span>
  );
}
