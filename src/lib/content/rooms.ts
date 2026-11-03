import type { ComponentType } from "react";
import {
  ArchiveRestore,
  Bath,
  Car,
  Coffee,
  Flame,
  Home,
  Sofa,
  SoapDispenserDroplet,
  Tv,
  Utensils,
  Wind,
  type LucideProps,
} from "lucide-react";

export type RoomId = "villa" | "family-room" | "double-room";
export type Amenity = { icon: ComponentType<LucideProps>; label: string };

/** Display order across the site: the whole villa first, then the rooms. */
export const ROOM_ORDER: RoomId[] = ["villa", "family-room", "double-room"];

const ROOM_AMENITIES: Amenity[] = [
  { icon: Wind, label: "Air conditioning" },
  { icon: SoapDispenserDroplet, label: "Soap" },
  { icon: Car, label: "Free parking" },
  { icon: Coffee, label: "Kettle" },
  { icon: ArchiveRestore, label: "Cupboard" },
  { icon: Flame, label: "Hot water" },
];

export const AMENITIES: Record<RoomId, Amenity[]> = {
  villa: [
    { icon: Home, label: "2 bedrooms" },
    { icon: Bath, label: "2 bathrooms" },
    { icon: Utensils, label: "Full kitchen" },
    { icon: Sofa, label: "Living area" },
    { icon: Tv, label: "Smart TV" },
    { icon: Wind, label: "Air conditioning" },
    { icon: Car, label: "Free parking" },
    { icon: Coffee, label: "Kettle" },
    { icon: ArchiveRestore, label: "Cupboards" },
    { icon: Flame, label: "Hot water" },
  ],
  "family-room": ROOM_AMENITIES,
  "double-room": ROOM_AMENITIES,
};

export const TAGLINES: Record<RoomId, string> = {
  villa: "Complete privacy & luxury",
  "family-room": "Spacious & comfortable",
  "double-room": "Intimate & luxurious",
};

export function isRoomId(id: string): id is RoomId {
  return (ROOM_ORDER as string[]).includes(id);
}

/** "7000-8000" → "7,000–8,000"; 18000 → "18,000" */
export function formatPrice(price: number | string | undefined | null, fallback = "") {
  if (price === undefined || price === null || price === "") return fallback;
  const parts = String(price)
    .split("-")
    .map((p) => Number(p.replace(/[^\d.]/g, "")))
    .filter((n) => Number.isFinite(n) && n > 0);
  return parts.length ? parts.map((n) => n.toLocaleString("en-US")).join("–") : fallback;
}
