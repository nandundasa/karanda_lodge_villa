"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, BedDouble } from "lucide-react";
import { Panel, SaveBar, useToast } from "./ui";
import { formatPrice } from "@/lib/content/rooms";

type Room = { id: string; name: string; price: number | string };

type Props = {
  rooms: Room[];
  onSave: (prices: Record<string, string>) => Promise<boolean>;
};

const VALID = /^\d{3,7}(\s*-\s*\d{3,7})?$/; // "6000" or "7000-8000"

export default function PricesPanel({ rooms, onSave }: Props) {
  const toast = useToast();
  const initial = Object.fromEntries(rooms.map((r) => [r.id, String(r.price ?? "")]));
  const [draft, setDraft] = useState<Record<string, string>>(initial);
  const [saving, setSaving] = useState(false);

  const changed = rooms.filter((r) => (draft[r.id] ?? "").replace(/\s/g, "") !== String(r.price ?? "").replace(/\s/g, ""));
  const invalid = rooms.filter((r) => !VALID.test((draft[r.id] ?? "").trim()));

  const save = async () => {
    if (invalid.length) {
      toast(`Check the price for ${invalid.map((r) => r.name).join(", ")}: use a number like 6000 or a range like 7000-8000.`, "error");
      return;
    }
    setSaving(true);
    try {
      const prices = Object.fromEntries(changed.map((r) => [r.id, draft[r.id].replace(/\s/g, "")]));
      if (await onSave(prices)) toast("Prices updated on the website.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel title="Room prices" description="Nightly rates shown across the website. Use a range like 7000-8000 if it varies.">
      <div className="overflow-x-auto rounded-2xl ring-1 ring-sage-100">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="bg-sage-50/80 text-xs uppercase tracking-wider text-sage-500">
              <th scope="col" className="px-5 py-3 font-medium">Room</th>
              <th scope="col" className="px-5 py-3 font-medium">Current</th>
              <th scope="col" className="px-5 py-3 font-medium">New price (Rs. / night)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sage-100">
            {rooms.map((r, i) => {
              const value = draft[r.id] ?? "";
              const isChanged = changed.includes(r);
              const isInvalid = !VALID.test(value.trim());
              return (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`transition-colors ${isChanged ? "bg-gold-100/40" : "hover:bg-leaf-50/40"}`}
                >
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-lg bg-forest-50 text-forest-700">
                        <BedDouble className="size-4" />
                      </span>
                      <span className="font-medium text-forest-900">{r.name}</span>
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono tabular-nums text-sage-600">Rs.{formatPrice(r.price, "–")}</td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-3">
                      <label
                        className={`flex h-11 w-48 items-center rounded-xl bg-white ring-1 transition-all focus-within:ring-2 ${
                          isInvalid ? "ring-rose-300 focus-within:ring-rose-400" : "ring-sage-200 focus-within:ring-leaf-500"
                        }`}
                      >
                        <span className="pl-3 pr-1.5 text-sage-400">Rs.</span>
                        <input
                          value={value}
                          inputMode="numeric"
                          aria-label={`New price for ${r.name}`}
                          aria-invalid={isInvalid}
                          onChange={(e) => setDraft((d) => ({ ...d, [r.id]: e.target.value }))}
                          className="w-full bg-transparent pr-3 font-mono tabular-nums text-forest-900 outline-none"
                        />
                      </label>
                      {isChanged && !isInvalid && (
                        <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-gold-700">
                          <ArrowRight className="size-3.5" /> Rs.{formatPrice(value)}
                        </motion.span>
                      )}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <SaveBar
        show={changed.length > 0}
        saving={saving}
        onSave={save}
        onDiscard={() => setDraft(initial)}
        message={`${changed.length} price${changed.length === 1 ? "" : "s"} changed`}
      />
    </Panel>
  );
}
